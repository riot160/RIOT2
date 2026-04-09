// ═══════════════════════════════════════════════════
//  RIOT MD  ·  MESSAGE HANDLER  (full featured)
// ═══════════════════════════════════════════════════

import { jidDecode, downloadContentFromMessage } from '@whiskeysockets/baileys';
import { config }    from '../config.js';
import { commands, checkCooldown } from './commands.js';
import { sessions }  from './session.js';
import { dbGet }     from './database.js';
import fetch         from 'node-fetch';

// ── Message text extractor ────────────────────────
function extractText(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation                                ||
    m.extendedTextMessage?.text                   ||
    m.imageMessage?.caption                       ||
    m.videoMessage?.caption                       ||
    m.buttonsResponseMessage?.selectedDisplayText ||
    m.listResponseMessage?.title                  ||
    ''
  );
}

// ── Cache for anti-edit / anti-delete ─────────────
export const msgCache = new Map();

// ── Build context object passed to every plugin ───
function buildContext(sock, msg, userId) {
  const jid     = msg.key.remoteJid || '';
  const isGroup = jid.endsWith('@g.us');
  const fromMe  = msg.key.fromMe;

  const sender = isGroup
    ? (msg.key.participant || jid)
    : fromMe
      ? (sock.user?.id || jid)
      : jid;

  const senderNumber = jidDecode(sender)?.user
    || sender.split(':')[0].split('@')[0];

  // Resolve owner: runtime config OR DB-stored auto-detected number
  const ownerNum  = config.OWNER_NUMBER.replace(/\D/g, '');
  const isOwner   = senderNumber === ownerNum
    || senderNumber === ownerNum.replace(/^0/, '254');

  const body   = extractText(msg);
  const prefix = config.PREFIX;
  const isCmd  = body.startsWith(prefix);
  const [rawCmd = '', ...argArr] = isCmd
    ? body.slice(prefix.length).trim().split(/\s+/)
    : [''];

  const command = rawCmd.toLowerCase();
  const args    = argArr;
  const text    = args.join(' ');

  const reply = (content) =>
    typeof content === 'string'
      ? sock.sendMessage(jid, { text: content }, { quoted: msg })
      : sock.sendMessage(jid, content, { quoted: msg });

  const react = (emoji) =>
    sock.sendMessage(jid, { react: { text: emoji, key: msg.key } });

  return {
    sock, msg, userId, jid, sender, senderNumber,
    isGroup, isOwner, fromMe, isCmd,
    command, args, text, body, prefix,
    reply, react,
    pushName: msg.pushName || senderNumber,
  };
}

// ── Normalize phone numbers for comparison ───────
function normalizeNumber(num) {
  const cleaned = String(num).replace(/\D/g, '');
  // Handle both 254 and 0 prefix for Kenya numbers
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('0')) return '254' + cleaned.slice(1);
  return cleaned;
}

// ── MAIN MESSAGE HANDLER ──────────────────────────
export async function messageHandler(sock, msg, userId) {
  if (!msg.message) return;

  // Skip system/protocol messages
  const msgType = Object.keys(msg.message)[0];
  const SKIP_TYPES = [
    'protocolMessage', 'senderKeyDistributionMessage',
    'pollUpdateMessage', 'reactionMessage',
  ];
  if (SKIP_TYPES.includes(msgType)) return;

  // Skip status broadcast (handled by statusHandler)
  if (msg.key.remoteJid === 'status@broadcast') return;

  const ctx      = buildContext(sock, msg, userId);
  const settings = (await dbGet(`settings:${userId}`)) || {};

  // ── Cache message for anti-delete / anti-edit ──
  if (!msg.key.fromMe) {
    msgCache.set(msg.key.id, {
      text:   ctx.body,
      jid:    ctx.jid,
      sender: ctx.sender,
      name:   ctx.pushName,
      time:   Date.now(),
    });
    // Keep cache trimmed to 300 entries
    if (msgCache.size > 300) {
      const oldest = msgCache.keys().next().value;
      msgCache.delete(oldest);
    }
  }

  // ── Ignore list: skip messages from ignored numbers ──
  const ignoreList = settings.ignoreList || [];
  if (!ctx.isOwner && ignoreList.includes(ctx.senderNumber)) return;

  // ── Auto-read ──────────────────────────────────
  if (settings.autoread !== false && config.AUTO_READ) {
    await sock.readMessages([msg.key]).catch(() => {});
  }

  // ── Anti bug: skip excessively long / malformed messages ──
  if (settings.antibug && ctx.body.length > 4000) return;

  // ── Anti view-once: re-send view-once media ───
  if (settings.antiviewonce && !msg.key.fromMe) {
    const voKey = Object.keys(msg.message).find(k =>
      msg.message[k]?.viewOnce === true
    );
    if (voKey) {
      const mediaType = voKey.replace('Message', '');
      try {
        const stream = await downloadContentFromMessage(msg.message[voKey], mediaType);
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buf = Buffer.concat(chunks);
        await sock.sendMessage(ctx.jid, {
          [mediaType === 'image' ? 'image' : 'video']: buf,
          caption: `🔓 *Anti View-Once*\nFrom: ${ctx.pushName}`,
        });
      } catch {}
    }
  }

  // ── Auto react to every incoming message ──────
  const REACT_EMOJIS = ['❤️', '🔥', '👍', '😂', '🎉', '💯', '⚡', '🙌'];
  if (settings.autoreact && !msg.key.fromMe) {
    const emoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
    await ctx.react(emoji).catch(() => {});
  }

  // ── Chatbot: AI replies to non-command messages ──
  if (settings.chatbot && !ctx.isCmd && !msg.key.fromMe && ctx.body.trim()) {
    try {
      const res  = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(ctx.body)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(10000) }
      );
      const text = await res.text();
      if (text?.trim()) await ctx.reply(`🤖 ${text.trim()}`);
    } catch {}
    return;
  }

  if (!ctx.isCmd) return;

  // ── Private mode: only owner can use commands ──
  if (config.MODE === 'private' && !ctx.isOwner) return;

  // ── Auto-typing presence ──────────────────────
  if (settings.autotyping !== false && config.AUTO_TYPING) {
    const presenceType = settings.autorecord ? 'recording' : 'composing';
    await sock.sendPresenceUpdate(presenceType, ctx.jid).catch(() => {});
  }

  const plugin = commands.get(ctx.command);
  if (!plugin) return;

  // ── Sudo check: sudo users get owner access ───
  // FIXED: Normalize numbers for proper comparison
  const sudoList = (settings.sudoList || []).map(normalizeNumber);
  const normalizedSender = normalizeNumber(ctx.senderNumber);
  const isSudo   = sudoList.includes(normalizedSender);
  const hasOwnerAccess = ctx.isOwner || isSudo;

  // ── Permission checks ─────────────────────────
  if (plugin.owner && !hasOwnerAccess) {
    return ctx.reply('❌ *Owner only command.*');
  }
  if (plugin.group && !ctx.isGroup) {
    return ctx.reply('❌ *This command only works inside a group.*');
  }

  // ── Cooldown (skipped for owner / sudo) ───────
  if (!hasOwnerAccess) {
    const wait = checkCooldown(ctx.senderNumber, ctx.command);
    if (wait > 0) {
      return ctx.reply(`⏳ Wait *${wait}s* before using this command again.`);
    }
  }

  // ── Track command count ───────────────────────
  const session = sessions.get(userId);
  if (session) session.commandCount++;

  // ── Execute plugin ────────────────────────────
  try {
    await ctx.react('⚙️');
    await plugin.run(ctx);
  } catch (err) {
    console.error(`  ❌  Command error [.${ctx.command}]:`, err.message);
    await ctx.reply(`❌ *Error:*\n${err.message}`);
  }
}

// ── STATUS HANDLER ────────────────────────────────
export async function statusHandler(sock, msg, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  const sender   = msg.key.participant || '';
  const jid      = msg.key.remoteJid;

  // Auto view status
  if (settings.autoviewstatus) {
    if (settings.statusDelay) {
      await new Promise(r => setTimeout(r, settings.statusDelay));
    }
    await sock.readMessages([msg.key]).catch(() => {});
  }

  // Auto react to status
  if (settings.autoreactstatus && sender) {
    const emoji = settings.statusEmoji || '🔥';
    await sock.sendMessage(
      jid,
      { react: { text: emoji, key: msg.key } },
      { statusJidList: [sender, sock.user?.id].filter(Boolean) }
    ).catch(() => {});
  }

  // Auto save status media to owner DM
  if (settings.autosavestatus && msg.message) {
    const type = Object.keys(msg.message)[0];
    if (['imageMessage', 'videoMessage'].includes(type)) {
      try {
        const mediaType = type.replace('Message', '');
        const stream    = await downloadContentFromMessage(msg.message[type], mediaType);
        const chunks    = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buf       = Buffer.concat(chunks);
        const ownerJid  = config.OWNER_NUMBER + '@s.whatsapp.net';
        await sock.sendMessage(ownerJid, {
          [mediaType === 'image' ? 'image' : 'video']: buf,
          caption: `💾 *Status Saved*\n👤 From: ${sender?.split('@')[0] || 'Unknown'}`,
        });
      } catch {}
    }
  }

  // Anti-delete status: save status before it gets deleted
  // FIXED: Added this handler for antideletestatus setting
  if (settings.antideletestatus && msg.message) {
    const type = Object.keys(msg.message)[0];
    if (['imageMessage', 'videoMessage'].includes(type)) {
      try {
        const mediaType = type.replace('Message', '');
        const stream    = await downloadContentFromMessage(msg.message[type], mediaType);
        const chunks    = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buf       = Buffer.concat(chunks);
        const ownerJid  = config.OWNER_NUMBER + '@s.whatsapp.net';
        await sock.sendMessage(ownerJid, {
          [mediaType === 'image' ? 'image' : 'video']: buf,
          caption: `🛡️ *Anti-Delete Status*\n👤 From: ${sender?.split('@')[0] || 'Unknown'}\n⏰ Saved before deletion`,
        });
      } catch {}
    }
  }
}

// ── MESSAGES.DELETE HANDLER ──────────────────────
export async function deletedMsgHandler(sock, item, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  if (!settings.antidelete) return;
  const keys = item.keys || [];
  for (const key of keys) {
    const cached = msgCache.get(key.id);
    if (!cached) continue;
    try {
      await sock.sendMessage(cached.jid, {
        text: `🛡️ *Anti-Delete*\n👤 ${cached.name} deleted:\n\n${cached.text || '[media message]'}`,
      });
    } catch {}
  }
}

// ── MESSAGES.UPDATE (anti-edit) ──────────────────
export async function editedMsgHandler(sock, updates, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  if (!settings.antiedit) return;
  for (const update of updates) {
    if (!update.update?.message) continue;
    const cached = msgCache.get(update.key.id);
    if (!cached || !cached.text) continue;
    try {
      await sock.sendMessage(cached.jid, {
        text: `✏️ *Anti-Edit*\n👤 ${cached.name} edited their message.\n\n*Original:*\n${cached.text}`,
      });
    } catch {}
  }
    }

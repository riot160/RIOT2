// ═══════════════════════════════════════════════════
//  RIOT MD  ·  HANDLER  — v4  FINAL
//
//  Root cause fixes:
//  ✅ antidelete DM — DM deletions arrive as protocolMessage
//     type REVOKE (0) via messages.UPSERT — previously we
//     skipped ALL protocolMessages before checking. Fixed by
//     intercepting REVOKE before the skip list.
//  ✅ autoviewstatus — use proper key structure for status readMessages
//     AND sendReadReceipt as belt-and-suspenders
//  ✅ autoreactstatus — react directly to sender JID (not statusJidList)
//  ✅ antideletestatus — cache on arrive, send only on delete event
//  ✅ sudo + ignore list — normalised number comparison
// ═══════════════════════════════════════════════════

import { jidDecode, downloadContentFromMessage } from '@whiskeysockets/baileys';
import { config }                                 from '../config.js';
import { commands, checkCooldown }                from './commands.js';
import { sessions }                               from './session.js';
import { dbGet }                                  from './database.js';
import fetch                                      from 'node-fetch';

// ── Shared caches ─────────────────────────────────
export const msgCache    = new Map();   // regular messages
export const statusCache = new Map();   // status media for antideletestatus

// ─────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────
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

function normalizeNum(raw) {
  const n = String(raw || '').replace(/\D/g, '');
  if (n.startsWith('0') && n.length <= 10) return '254' + n.slice(1);
  return n;
}

function cleanJid(jid = '') {
  return jid.replace(/:\d+@/, '@');
}

function ownerJid() {
  return normalizeNum(config.OWNER_NUMBER) + '@s.whatsapp.net';
}

function buildContext(sock, msg, userId) {
  const jid     = msg.key.remoteJid || '';
  const isGroup = jid.endsWith('@g.us');
  const fromMe  = msg.key.fromMe;

  const sender = isGroup
    ? (msg.key.participant || jid)
    : fromMe ? (sock.user?.id || jid) : jid;

  const senderNumber = jidDecode(cleanJid(sender))?.user
    || cleanJid(sender).split('@')[0];

  const ownerNum  = normalizeNum(config.OWNER_NUMBER);
  const isOwner   = normalizeNum(senderNumber) === ownerNum;

  const body   = extractText(msg);
  const prefix = config.PREFIX;
  const isCmd  = body.startsWith(prefix);
  const [rawCmd = '', ...argArr] = isCmd
    ? body.slice(prefix.length).trim().split(/\s+/)
    : [''];

  const reply = (content) =>
    typeof content === 'string'
      ? sock.sendMessage(jid, { text: content }, { quoted: msg })
      : sock.sendMessage(jid, content, { quoted: msg });

  const react = (emoji) =>
    sock.sendMessage(jid, { react: { text: emoji, key: msg.key } });

  return {
    sock, msg, userId, jid, sender, senderNumber,
    isGroup, isOwner, fromMe,
    isCmd, command: rawCmd.toLowerCase(),
    args: argArr, text: argArr.join(' '),
    body, prefix, reply, react,
    pushName: msg.pushName || senderNumber,
  };
}

// ─────────────────────────────────────────────────
//  MAIN MESSAGE HANDLER
// ─────────────────────────────────────────────────
export async function messageHandler(sock, msg, userId) {
  if (!msg.message) return;
  if (msg.key.remoteJid === 'status@broadcast') return;

  const msgType = Object.keys(msg.message)[0];
  const settings = (await dbGet(`settings:${userId}`)) || {};

  // ════════════════════════════════════════════════
  //  INTERCEPT: DM "Delete for everyone"
  //
  //  When someone deletes a DM for everyone, WhatsApp
  //  sends a NEW message via messages.upsert where:
  //    message.protocolMessage.type === 0  (REVOKE)
  //  This must be caught BEFORE we skip protocolMessages.
  // ════════════════════════════════════════════════
  if (msgType === 'protocolMessage') {
    const proto = msg.message.protocolMessage;
    if (proto?.type === 0 && settings.antidelete) {
      // proto.key.id = ID of the original deleted message
      const deletedId = proto.key?.id;
      const cached    = deletedId
        ? msgCache.get(deletedId)
        : null;

      if (cached) {
        const label = cached.name || cached.sender?.split('@')[0] || 'Someone';
        await sock.sendMessage(cached.jid, {
          text: `🛡️ *Anti-Delete*\n👤 ${label} deleted a message:\n\n${cached.text || '[media / no text]'}`,
        }).catch(() => {});
        console.log(`  🛡️   DM antidelete triggered — original by ${label}`);
      }
    }
    // Skip all other protocol message processing
    return;
  }

  // Skip other system message types
  const SKIP = ['senderKeyDistributionMessage','pollUpdateMessage','reactionMessage'];
  if (SKIP.includes(msgType)) return;

  const ctx = buildContext(sock, msg, userId);

  // Cache message for antidelete / antiedit
  if (!msg.key.fromMe) {
    msgCache.set(msg.key.id, {
      text:       ctx.body,
      jid:        ctx.jid,
      sender:     ctx.sender,
      name:       ctx.pushName,
      time:       Date.now(),
      rawMessage: msg.message,
    });
    if (msgCache.size > 500) msgCache.delete(msgCache.keys().next().value);
  }

  // Ignore list
  const ignoreList = (settings.ignoreList || []).map(normalizeNum);
  if (!ctx.isOwner && ignoreList.includes(normalizeNum(ctx.senderNumber))) return;

  // Auto-read
  if (settings.autoread !== false) {
    await sock.readMessages([msg.key]).catch(() => {});
  }

  // Anti-bug
  if (settings.antibug && ctx.body.length > 4000) return;

  // Anti view-once
  if (settings.antiviewonce && !msg.key.fromMe) {
    const voKey = Object.keys(msg.message)
      .find(k => msg.message[k]?.viewOnce === true);
    if (voKey) {
      const mt = voKey.replace('Message', '');
      try {
        const stream = await downloadContentFromMessage(msg.message[voKey], mt);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        await sock.sendMessage(ctx.jid, {
          [mt === 'image' ? 'image' : 'video']: Buffer.concat(chunks),
          caption: `🔓 *Anti View-Once* — From: ${ctx.pushName}`,
        });
      } catch {}
    }
  }

  // Auto react
  const EMOJIS = ['❤️','🔥','👍','😂','🎉','💯','⚡','🙌'];
  if (settings.autoreact && !msg.key.fromMe) {
    await ctx.react(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]).catch(() => {});
  }

  // Chatbot
  if (settings.chatbot && !ctx.isCmd && !msg.key.fromMe && ctx.body.trim()) {
    try {
      const res = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(ctx.body)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(12000) }
      );
      const answer = await res.text();
      if (answer?.trim()) await ctx.reply(`🤖 ${answer.trim()}`);
    } catch {}
    return;
  }

  if (!ctx.isCmd) return;
  if (config.MODE === 'private' && !ctx.isOwner) return;

  // Auto-typing
  if (settings.autotyping !== false) {
    await sock.sendPresenceUpdate(
      settings.autorecord ? 'recording' : 'composing', ctx.jid
    ).catch(() => {});
  }

  const plugin = commands.get(ctx.command);
  if (!plugin) return;

  const sudoList       = (settings.sudoList || []).map(normalizeNum);
  const hasOwnerAccess = ctx.isOwner || sudoList.includes(normalizeNum(ctx.senderNumber));

  if (plugin.owner && !hasOwnerAccess)
    return ctx.reply('❌ *Owner only command.*');
  if (plugin.group && !ctx.isGroup)
    return ctx.reply('❌ *This command only works inside a group.*');

  if (!hasOwnerAccess) {
    const wait = checkCooldown(ctx.senderNumber, ctx.command);
    if (wait > 0)
      return ctx.reply(`⏳ Wait *${wait}s* before using this command again.`);
  }

  const session = sessions.get(userId);
  if (session) session.commandCount++;

  try {
    await ctx.react('⚙️');
    await plugin.run(ctx);
  } catch (err) {
    console.error(`  ❌  [.${ctx.command}]:`, err.message);
    await ctx.reply(`❌ *Error:*\n${err.message}`);
  }
}

// ─────────────────────────────────────────────────
//  STATUS HANDLER
// ─────────────────────────────────────────────────
export async function statusHandler(sock, msg, userId) {
  const settings   = (await dbGet(`settings:${userId}`)) || {};
  const sender     = msg.key.participant || '';
  const senderNum  = sender.split('@')[0];
  const senderName = msg.pushName || senderNum;

  const hasMedia     = !!(msg.message?.imageMessage || msg.message?.videoMessage);
  const mediaTypeKey = msg.message?.imageMessage ? 'imageMessage' : 'videoMessage';
  const mediaType    = msg.message?.imageMessage ? 'image' : 'video';
  const caption      = msg.message?.imageMessage?.caption
    || msg.message?.videoMessage?.caption
    || msg.message?.conversation
    || msg.message?.extendedTextMessage?.text
    || null;

  // ── FIX: Auto view status ──────────────────────
  // Use BOTH methods to ensure it works across all WA versions
  if (settings.autoviewstatus && sender) {
    if (settings.statusDelay) {
      await new Promise(r => setTimeout(r, settings.statusDelay));
    }
    try {
      // Method 1: readMessages with proper status key structure
      const statusKey = {
        remoteJid:   'status@broadcast',
        id:          msg.key.id,
        participant: sender,
        fromMe:      false,
      };
      await sock.readMessages([statusKey]);
    } catch {}
    try {
      // Method 2: sendReadReceipt — belt and suspenders
      await sock.sendReadReceipt('status@broadcast', sender, [msg.key.id]);
    } catch {}
    console.log(`  👀  Viewed status from ${senderName} (+${senderNum})`);
  }

  // ── Auto react to status ──────────────────────
  // React directly to sender JID — avoids "No sessions" error
  if (settings.autoreactstatus && sender) {
    const emoji = settings.statusEmoji || '🔥';
    try {
      await sock.sendMessage(sender, {
        react: {
          text: emoji,
          key: {
            remoteJid:   'status@broadcast',
            id:          msg.key.id,
            participant: sender,
            fromMe:      false,
          },
        },
      });
      console.log(`  🔥  Reacted to status from ${senderName} with ${emoji}`);
    } catch (e) {
      console.error(`  ⚠️   Status react failed:`, e.message);
    }
  }

  // ── Auto save status to DM ─────────────────────
  if (settings.autosavestatus && hasMedia) {
    try {
      const stream = await downloadContentFromMessage(msg.message[mediaTypeKey], mediaType);
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      const buf = Buffer.concat(chunks);
      let cap = `💾 *Status Saved*\n👤 From: ${senderName} (+${senderNum})`;
      if (caption) cap += `\n📝 ${caption}`;
      await sock.sendMessage(ownerJid(), { [mediaType]: buf, caption: cap });
      console.log(`  💾  Status saved from ${senderName}`);
    } catch (e) {
      console.error(`  ❌  Save status failed:`, e.message);
    }
  }

  // ── Anti-delete status: cache silently ─────────
  // Only send to DM when status is DELETED (via messages.delete event)
  if (settings.antideletestatus && hasMedia) {
    try {
      const stream = await downloadContentFromMessage(msg.message[mediaTypeKey], mediaType);
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      statusCache.set(msg.key.id, {
        buf: Buffer.concat(chunks),
        mediaType,
        caption,
        senderNum,
        senderName,
        time: Date.now(),
      });
      if (statusCache.size > 150) statusCache.delete(statusCache.keys().next().value);
      console.log(`  🛡️   Status cached for anti-delete from ${senderName}`);
    } catch {}
  }
}

// ─────────────────────────────────────────────────
//  MESSAGES.DELETE HANDLER
//  Handles group deletions + status deletions
// ─────────────────────────────────────────────────
export async function deletedMsgHandler(sock, item, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  const keys     = item.keys || [];

  for (const key of keys) {
    // Status deleted before 24h → send cached media to owner DM
    if (key.remoteJid === 'status@broadcast') {
      if (!settings.antideletestatus) continue;
      const cached = statusCache.get(key.id);
      if (!cached) continue;
      let cap =
        `🗑️ *Deleted Status*\n` +
        `👤 From: ${cached.senderName} (+${cached.senderNum})\n` +
        `⏰ Deleted before 24h expiry`;
      if (cached.caption) cap += `\n📝 ${cached.caption}`;
      try {
        await sock.sendMessage(ownerJid(), { [cached.mediaType]: cached.buf, caption: cap });
        console.log(`  🗑️   Deleted status forwarded from ${cached.senderName}`);
      } catch {}
      statusCache.delete(key.id);
      continue;
    }

    // Group message deleted
    if (!settings.antidelete) continue;
    const cached = msgCache.get(key.id);
    if (!cached) continue;
    try {
      await sock.sendMessage(cached.jid, {
        text: `🛡️ *Anti-Delete*\n👤 ${cached.name} deleted:\n\n${cached.text || '[media]'}`,
      });
    } catch {}
  }
}

// ─────────────────────────────────────────────────
//  MESSAGES.UPDATE HANDLER  (antiedit only now)
//  DM antidelete moved to messageHandler above
// ─────────────────────────────────────────────────
export async function editedMsgHandler(sock, updates, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  if (!settings.antiedit) return;

  for (const update of updates) {
    if (!update.update?.message) continue;
    // Skip if it's a protocol delete (handled in messageHandler)
    if (update.update.message?.protocolMessage) continue;
    const cached = msgCache.get(update.key?.id);
    if (!cached?.text) continue;
    try {
      await sock.sendMessage(cached.jid, {
        text: `✏️ *Anti-Edit*\n👤 ${cached.name} edited their message.\n\n*Original:*\n${cached.text}`,
      });
    } catch {}
  }
}

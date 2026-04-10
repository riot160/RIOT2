// lib/handler.js — RIOT MD v5 FINAL
// Repo: https://github.com/riot160/RIOT2
// Fixes: antidelete→DM, autoviewstatus, antideletestatus

import { jidDecode, downloadContentFromMessage } from '@whiskeysockets/baileys';
import { config }                                 from '../config.js';
import { commands, checkCooldown }                from './commands.js';
import { sessions }                               from './session.js';
import { dbGet }                                  from './database.js';
import fetch                                      from 'node-fetch';

export const msgCache    = new Map();
export const statusCache = new Map();

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

function cleanJid(jid = '') { return jid.replace(/:\d+@/, '@'); }
function ownerJid()          { return normalizeNum(config.OWNER_NUMBER) + '@s.whatsapp.net'; }

function buildContext(sock, msg, userId) {
  const jid     = msg.key.remoteJid || '';
  const isGroup = jid.endsWith('@g.us');
  const fromMe  = msg.key.fromMe;
  const sender  = isGroup
    ? (msg.key.participant || jid)
    : fromMe ? (sock.user?.id || jid) : jid;

  const senderNumber = jidDecode(cleanJid(sender))?.user || cleanJid(sender).split('@')[0];
  const isOwner      = normalizeNum(senderNumber) === normalizeNum(config.OWNER_NUMBER);

  const body   = extractText(msg);
  const prefix = config.PREFIX;
  const isCmd  = body.startsWith(prefix);
  const [rawCmd = '', ...argArr] = isCmd
    ? body.slice(prefix.length).trim().split(/\s+/) : [''];

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
export async function messageHandler(sock, msg, userId) {
  if (!msg.message) return;
  if (msg.key.remoteJid === 'status@broadcast') return;

  const msgType  = Object.keys(msg.message)[0];
  const settings = (await dbGet(`settings:${userId}`)) || {};

  // ── Intercept DM delete (protocolMessage REVOKE) ──
  // Must happen BEFORE the skip list. Sends to owner DM.
  if (msgType === 'protocolMessage') {
    const proto = msg.message.protocolMessage;
    if (proto?.type === 0 && settings.antidelete) {
      const cached = msgCache.get(proto.key?.id);
      if (cached) {
        const src = cached.jid?.endsWith('@g.us')
          ? `Group chat` : `DM with +${cached.sender?.split('@')[0]}`;
        await sock.sendMessage(ownerJid(), {
          text:
            `🛡️ *Anti-Delete*\n` +
            `👤 From : ${cached.name}\n` +
            `📍 Chat : ${src}\n\n` +
            `🗑️ Deleted:\n${cached.text || '[media]'}`,
        }).catch(() => {});
      }
    }
    return;
  }

  const SKIP = ['senderKeyDistributionMessage','pollUpdateMessage','reactionMessage'];
  if (SKIP.includes(msgType)) return;

  const ctx = buildContext(sock, msg, userId);

  // Cache for antidelete/antiedit
  if (!msg.key.fromMe) {
    msgCache.set(msg.key.id, {
      text: ctx.body, jid: ctx.jid, sender: ctx.sender,
      name: ctx.pushName, time: Date.now(), rawMessage: msg.message,
    });
    if (msgCache.size > 500) msgCache.delete(msgCache.keys().next().value);
  }

  const ignoreList = (settings.ignoreList || []).map(normalizeNum);
  if (!ctx.isOwner && ignoreList.includes(normalizeNum(ctx.senderNumber))) return;

  if (settings.autoread !== false) await sock.readMessages([msg.key]).catch(() => {});
  if (settings.antibug && ctx.body.length > 4000) return;

  // Anti view-once
  if (settings.antiviewonce && !msg.key.fromMe) {
    const voKey = Object.keys(msg.message).find(k => msg.message[k]?.viewOnce === true);
    if (voKey) {
      const mt = voKey.replace('Message', '');
      try {
        const stream = await downloadContentFromMessage(msg.message[voKey], mt);
        const chunks = []; for await (const c of stream) chunks.push(c);
        await sock.sendMessage(ctx.jid, {
          [mt === 'image' ? 'image' : 'video']: Buffer.concat(chunks),
          caption: `🔓 *Anti View-Once* — From: ${ctx.pushName}`,
        });
      } catch {}
    }
  }

  const EMOJIS = ['❤️','🔥','👍','😂','🎉','💯','⚡','🙌'];
  if (settings.autoreact && !msg.key.fromMe)
    await ctx.react(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]).catch(() => {});

  if (settings.chatbot && !ctx.isCmd && !msg.key.fromMe && ctx.body.trim()) {
    try {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(ctx.body)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(12000) });
      const ans = await res.text();
      if (ans?.trim()) await ctx.reply(`🤖 ${ans.trim()}`);
    } catch {}
    return;
  }

  if (!ctx.isCmd) return;
  if (config.MODE === 'private' && !ctx.isOwner) return;

  if (settings.autotyping !== false)
    await sock.sendPresenceUpdate(settings.autorecord ? 'recording' : 'composing', ctx.jid).catch(() => {});

  const plugin = commands.get(ctx.command);
  if (!plugin) return;

  const sudoList       = (settings.sudoList || []).map(normalizeNum);
  const hasOwnerAccess = ctx.isOwner || sudoList.includes(normalizeNum(ctx.senderNumber));

  if (plugin.owner && !hasOwnerAccess) return ctx.reply('❌ *Owner only command.*');
  if (plugin.group && !ctx.isGroup)    return ctx.reply('❌ *Group only command.*');

  if (!hasOwnerAccess) {
    const wait = checkCooldown(ctx.senderNumber, ctx.command);
    if (wait > 0) return ctx.reply(`⏳ Wait *${wait}s* first.`);
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
  // sendReadReceipt(senderJid, null, [msgId]) is the correct call.
  // WhatsApp native app sends the read receipt to the SENDER's JID,
  // not to status@broadcast. This is what marks the status as "viewed".
  if (settings.autoviewstatus && sender) {
    if (settings.statusDelay) await new Promise(r => setTimeout(r, settings.statusDelay));
    try {
      await sock.sendReadReceipt(sender, null, [msg.key.id]);
      console.log(`  👀  Viewed status from ${senderName} (+${senderNum})`);
    } catch {
      await sock.readMessages([msg.key]).catch(() => {});
    }
  }

  // ── Auto react to status ──────────────────────
  if (settings.autoreactstatus && sender) {
    const emoji = settings.statusEmoji || '🔥';
    try {
      await sock.sendMessage(sender, {
        react: {
          text: emoji,
          key: { remoteJid: 'status@broadcast', id: msg.key.id, participant: sender, fromMe: false },
        },
      });
      console.log(`  🔥  Reacted to status from ${senderName} with ${emoji}`);
    } catch (e) {
      console.error(`  ⚠️   Status react failed:`, e.message);
    }
  }

  // ── Auto save to owner DM ─────────────────────
  if (settings.autosavestatus && hasMedia) {
    try {
      const stream = await downloadContentFromMessage(msg.message[mediaTypeKey], mediaType);
      const chunks = []; for await (const c of stream) chunks.push(c);
      let cap = `💾 *Status Saved*\n👤 From: ${senderName} (+${senderNum})`;
      if (caption) cap += `\n📝 ${caption}`;
      await sock.sendMessage(ownerJid(), { [mediaType]: Buffer.concat(chunks), caption: cap });
    } catch {}
  }

  // ── Cache for antideletestatus ─────────────────
  // Deletion arrives via messages.update (editedMsgHandler) as
  // messageStubType === 1 with remoteJid === status@broadcast
  if (settings.antideletestatus && hasMedia) {
    try {
      const stream = await downloadContentFromMessage(msg.message[mediaTypeKey], mediaType);
      const chunks = []; for await (const c of stream) chunks.push(c);
      statusCache.set(msg.key.id, {
        buf: Buffer.concat(chunks), mediaType, caption,
        senderNum, senderName, time: Date.now(),
      });
      if (statusCache.size > 200) statusCache.delete(statusCache.keys().next().value);
    } catch {}
  }
}

// ─────────────────────────────────────────────────
export async function deletedMsgHandler(sock, item, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  const keys     = item.keys || [];

  for (const key of keys) {
    // Status deletion via messages.delete (some Baileys versions)
    if (key.remoteJid === 'status@broadcast') {
      if (!settings.antideletestatus) continue;
      const cached = statusCache.get(key.id);
      if (!cached) continue;
      try {
        let cap = `🗑️ *Deleted Status*\n👤 From: ${cached.senderName} (+${cached.senderNum})\n⏰ Deleted before 24h`;
        if (cached.caption) cap += `\n📝 ${cached.caption}`;
        await sock.sendMessage(ownerJid(), { [cached.mediaType]: cached.buf, caption: cap });
      } catch {}
      statusCache.delete(key.id);
      continue;
    }

    // Group message deleted → send to owner DM
    if (!settings.antidelete) continue;
    const cached = msgCache.get(key.id);
    if (!cached) continue;
    try {
      const src = key.remoteJid?.endsWith('@g.us') ? `Group chat` : `DM`;
      await sock.sendMessage(ownerJid(), {
        text: `🛡️ *Anti-Delete*\n👤 From : ${cached.name}\n📍 Chat : ${src}\n\n🗑️ Deleted:\n${cached.text || '[media]'}`,
      });
    } catch {}
  }
}

// ─────────────────────────────────────────────────
export async function editedMsgHandler(sock, updates, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};

  for (const update of updates) {
    const remoteJid = update.key?.remoteJid || '';
    const stubType  = update.update?.messageStubType;

    // ── STATUS DELETED (Baileys newer: stub type 1 on status@broadcast) ──
    if (remoteJid === 'status@broadcast' && stubType === 1) {
      if (!settings.antideletestatus) continue;
      const cached = statusCache.get(update.key?.id);
      if (!cached) continue;
      try {
        let cap = `🗑️ *Deleted Status*\n👤 From: ${cached.senderName} (+${cached.senderNum})\n⏰ Deleted before 24h`;
        if (cached.caption) cap += `\n📝 ${cached.caption}`;
        await sock.sendMessage(ownerJid(), { [cached.mediaType]: cached.buf, caption: cap });
        console.log(`  🗑️   Deleted status → owner DM from ${cached.senderName}`);
      } catch {}
      statusCache.delete(update.key.id);
      continue;
    }

    // ── NON-STATUS MESSAGE DELETED (stub type 1) ──
    if (stubType === 1 && remoteJid !== 'status@broadcast') {
      if (!settings.antidelete) continue;
      const cached = msgCache.get(update.key?.id);
      if (!cached) continue;
      try {
        const src = remoteJid.endsWith('@g.us') ? `Group chat` : `DM`;
        await sock.sendMessage(ownerJid(), {
          text: `🛡️ *Anti-Delete*\n👤 From : ${cached.name}\n📍 Chat : ${src}\n\n🗑️ Deleted:\n${cached.text || '[media]'}`,
        });
      } catch {}
      continue;
    }

    // ── MESSAGE EDITED ──
    if (!settings.antiedit) continue;
    if (!update.update?.message || update.update.message?.protocolMessage) continue;
    const cached = msgCache.get(update.key?.id);
    if (!cached?.text) continue;
    try {
      await sock.sendMessage(ownerJid(), {
        text: `✏️ *Anti-Edit*\n👤 From : ${cached.name}\n\n*Original:*\n${cached.text}`,
      });
    } catch {}
  }
}

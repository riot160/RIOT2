// ═══════════════════════════════════════════════════
//  RIOT MD  ·  HANDLER  — v3  ALL ISSUES FIXED
//
//  Fix log:
//  ✅ autoreactstatus  — react directly to sender JID
//                        (statusJidList causes "No sessions" error)
//  ✅ antideletestatus — cache status media on arrival,
//                        only send to DM when status is DELETED
//  ✅ antidelete DM    — handles BOTH Baileys delete formats:
//                          · messageStubType === 1  (revoke stub)
//                          · protocolMessage type 0 (revoke msg)
//  ✅ antidelete Group — messages.delete event (unchanged)
//  ✅ autoviewstatus   — sendReadReceipt (correct API)
//  ✅ autosavestatus   — forward every status media to DM
//  ✅ sudo             — normalised number comparison
//  ✅ getMessage       — returns real cached message
// ═══════════════════════════════════════════════════

import { jidDecode, downloadContentFromMessage } from '@whiskeysockets/baileys';
import { config }                                 from '../config.js';
import { commands, checkCooldown }                from './commands.js';
import { sessions }                               from './session.js';
import { dbGet }                                  from './database.js';
import fetch                                      from 'node-fetch';

// ─────────────────────────────────────────────────
//  Shared caches (exported — session.js uses them)
// ─────────────────────────────────────────────────

// Regular message cache for antidelete / antiedit
// key = msg.key.id  →  { text, jid, sender, name, time, rawMessage }
export const msgCache = new Map();

// Status media cache for antideletestatus
// key = msg.key.id  →  { buf, mediaType, caption, senderNum, senderName, time }
export const statusCache = new Map();

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

// Normalize to consistent digit-only number
function normalizeNum(raw) {
  const n = String(raw || '').replace(/\D/g, '');
  if (n.startsWith('0') && n.length <= 10) return '254' + n.slice(1);
  return n;
}

// Strip ":0" device suffix from Baileys JIDs
// "254700000000:0@s.whatsapp.net" → "254700000000@s.whatsapp.net"
function cleanJid(jid = '') {
  return jid.replace(/:\d+@/, '@');
}

// Build owner JID from config
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

  const msgType = Object.keys(msg.message)[0];
  const SKIP    = ['protocolMessage','senderKeyDistributionMessage',
                   'pollUpdateMessage','reactionMessage'];
  if (SKIP.includes(msgType)) return;
  if (msg.key.remoteJid === 'status@broadcast') return;

  const ctx      = buildContext(sock, msg, userId);
  const settings = (await dbGet(`settings:${userId}`)) || {};

  // Cache for antidelete / antiedit
  if (!msg.key.fromMe) {
    msgCache.set(msg.key.id, {
      text:       ctx.body,
      jid:        ctx.jid,
      sender:     ctx.sender,
      name:       ctx.pushName,
      time:       Date.now(),
      rawMessage: msg.message,
    });
    if (msgCache.size > 500) {
      msgCache.delete(msgCache.keys().next().value);
    }
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
      const mediaType = voKey.replace('Message', '');
      try {
        const stream = await downloadContentFromMessage(msg.message[voKey], mediaType);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        await sock.sendMessage(ctx.jid, {
          [mediaType === 'image' ? 'image' : 'video']: Buffer.concat(chunks),
          caption: `🔓 *Anti View-Once* — From: ${ctx.pushName}`,
        });
      } catch {}
    }
  }

  // Auto react to messages
  const EMOJIS = ['❤️','🔥','👍','😂','🎉','💯','⚡','🙌'];
  if (settings.autoreact && !msg.key.fromMe) {
    await ctx.react(EMOJIS[Math.floor(Math.random() * EMOJIS.length)]).catch(() => {});
  }

  // Chatbot AI reply
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

  // Sudo
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
  const settings     = (await dbGet(`settings:${userId}`)) || {};
  const sender       = msg.key.participant || '';
  const senderNum    = sender.split('@')[0];
  // Use WA push name (profile name) as fallback — device contacts not accessible
  const senderName   = msg.pushName || senderNum;

  const hasMedia     = !!(msg.message?.imageMessage || msg.message?.videoMessage);
  const mediaTypeKey = msg.message?.imageMessage ? 'imageMessage' : 'videoMessage';
  const mediaType    = msg.message?.imageMessage ? 'image' : 'video';
  const caption      = msg.message?.imageMessage?.caption
    || msg.message?.videoMessage?.caption
    || msg.message?.conversation
    || msg.message?.extendedTextMessage?.text
    || null;

  // ── Auto view status ──────────────────────────
  if (settings.autoviewstatus && sender) {
    if (settings.statusDelay) {
      await new Promise(r => setTimeout(r, settings.statusDelay));
    }
    try {
      await sock.sendReadReceipt('status@broadcast', sender, [msg.key.id]);
    } catch {
      await sock.readMessages([msg.key]).catch(() => {});
    }
    console.log(`  👀  Viewed status from ${senderName} (${senderNum})`);
  }

  // ── FIX: Auto react to status ─────────────────
  // WRONG: statusJidList requires pre-existing E2E sessions → "No sessions" error
  // RIGHT: React directly to the sender's JID — WhatsApp shows it on their status
  if (settings.autoreactstatus && sender) {
    const emoji = settings.statusEmoji || '🔥';
    try {
      await sock.sendMessage(sender, {
        react: {
          text: emoji,
          key: {
            remoteJid: 'status@broadcast',
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

  // ── Auto save status (every status → owner DM) ──
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

  // ── FIX: Anti-delete status ───────────────────
  // WRONG: Saved every status on arrival (not what user wants)
  // RIGHT: Cache status media silently. Only send to DM when status is DELETED.
  //        (The messages.delete handler in session.js triggers the actual send)
  if (settings.antideletestatus && hasMedia) {
    try {
      const stream = await downloadContentFromMessage(msg.message[mediaTypeKey], mediaType);
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      statusCache.set(msg.key.id, {
        buf:        Buffer.concat(chunks),
        mediaType,
        caption,
        senderNum,
        senderName,
        time:       Date.now(),
      });
      // Keep cache bounded to 150 statuses
      if (statusCache.size > 150) {
        statusCache.delete(statusCache.keys().next().value);
      }
      console.log(`  🛡️   Status cached for anti-delete from ${senderName}`);
    } catch (e) {
      console.error(`  ❌  Status cache failed:`, e.message);
    }
  }
}

// ─────────────────────────────────────────────────
//  ANTI-DELETE HANDLER  (messages.delete event)
//  Handles:
//  1. GROUP "delete for everyone" (fires reliably)
//  2. STATUS deletions (remoteJid === status@broadcast)
// ─────────────────────────────────────────────────
export async function deletedMsgHandler(sock, item, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  const keys     = item.keys || [];

  for (const key of keys) {

    // ── Status deleted before 24h ─────────────────
    if (key.remoteJid === 'status@broadcast') {
      if (!settings.antideletestatus) continue;
      const cached = statusCache.get(key.id);
      if (!cached) continue;
      let cap =
        `🗑️ *Deleted Status*\n` +
        `👤 From: ${cached.senderName} (+${cached.senderNum})\n` +
        `⏰ This status was deleted before the 24h expiry`;
      if (cached.caption) cap += `\n📝 ${cached.caption}`;
      try {
        await sock.sendMessage(ownerJid(), { [cached.mediaType]: cached.buf, caption: cap });
        console.log(`  🗑️   Deleted status sent to owner from ${cached.senderName}`);
      } catch {}
      statusCache.delete(key.id);
      continue;
    }

    // ── Regular group message deleted ────────────
    if (!settings.antidelete) continue;
    const cached = msgCache.get(key.id);
    if (!cached) continue;
    try {
      await sock.sendMessage(cached.jid, {
        text: `🛡️ *Anti-Delete*\n👤 ${cached.name} deleted:\n\n${cached.text || '[media / no text]'}`,
      });
    } catch {}
  }
}

// ─────────────────────────────────────────────────
//  MESSAGES.UPDATE HANDLER
//  Handles (in order):
//  1. DM deletion — messageStubType === 1  (Baileys revoke stub)
//  2. DM deletion — protocolMessage type 0 (older WA format)
//  3. Message edit — update.update.message present
// ─────────────────────────────────────────────────
export async function editedMsgHandler(sock, updates, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};

  for (const update of updates) {

    // ── Case 1: messageStubType 1 = deletion (newer Baileys) ──
    if (update.update?.messageStubType === 1) {
      if (!settings.antidelete) continue;
      // update.key.id IS the original deleted message ID in this format
      const cached = msgCache.get(update.key?.id);
      if (!cached) continue;
      try {
        await sock.sendMessage(cached.jid, {
          text: `🛡️ *Anti-Delete (DM)*\n👤 ${cached.name} deleted:\n\n${cached.text || '[media]'}`,
        });
      } catch {}
      continue;
    }

    // ── Case 2: protocolMessage type 0 = REVOKE (older format) ──
    const proto = update.update?.message?.protocolMessage;
    if (proto?.type === 0) {
      if (!settings.antidelete) continue;
      // The deleted message ID is inside proto.key.id
      const deletedId = proto.key?.id;
      const cached    = deletedId
        ? msgCache.get(deletedId)
        : msgCache.get(update.key?.id);   // fallback
      if (!cached) continue;
      try {
        await sock.sendMessage(cached.jid, {
          text: `🛡️ *Anti-Delete (DM)*\n👤 ${cached.name} deleted:\n\n${cached.text || '[media]'}`,
        });
      } catch {}
      continue;
    }

    // ── Case 3: message edit ───────────────────────
    if (!settings.antiedit) continue;
    if (!update.update?.message) continue;
    const cached = msgCache.get(update.key?.id);
    if (!cached?.text) continue;
    try {
      await sock.sendMessage(cached.jid, {
        text: `✏️ *Anti-Edit*\n👤 ${cached.name} edited their message.\n\n*Original:*\n${cached.text}`,
      });
    } catch {}
  }
}

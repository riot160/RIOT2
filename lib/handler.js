// ═══════════════════════════════════════════════════
//  RIOT MD  ·  MESSAGE HANDLER  — ALL BUGS FIXED
//
//  Fixes applied:
//  ✅ autoviewstatus  → sendReadReceipt (not readMessages)
//  ✅ autoreactstatus → clean JID without :0 device suffix
//  ✅ antidelete DM   → handles protocolMessage REVOKE in messages.update
//  ✅ antidelete Group → messages.delete event (unchanged, already worked)
//  ✅ antideletestatus → saves on receipt (correct, no WA delete event)
//  ✅ antiviewonce    → re-sends view-once as normal media
//  ✅ sudo            → normalised number comparison
//  ✅ chatbot         → AI fallback for non-commands
// ═══════════════════════════════════════════════════

import { jidDecode, downloadContentFromMessage } from '@whiskeysockets/baileys';
import { config }                                 from '../config.js';
import { commands, checkCooldown }                from './commands.js';
import { sessions }                               from './session.js';
import { dbGet }                                  from './database.js';
import fetch                                      from 'node-fetch';

// ── Shared message cache (exported for session.js getMessage) ──
// Key: message ID   Value: { text, jid, sender, name, time, rawMessage }
export const msgCache = new Map();

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

// Normalize any phone number to a consistent format for comparison
function normalizeNum(raw) {
  const n = String(raw || '').replace(/\D/g, '');
  // Kenyan 07xx → 2547xx, but works for any country
  if (n.startsWith('0') && n.length <= 10) return '254' + n.slice(1);
  return n;
}

// Clean a Baileys JID that may have :0 device suffix
// "254700000000:0@s.whatsapp.net" → "254700000000@s.whatsapp.net"
function cleanJid(jid) {
  if (!jid) return '';
  return jid.replace(/:\d+@/, '@');
}

// Build the rich context object passed to every plugin
function buildContext(sock, msg, userId) {
  const jid     = msg.key.remoteJid || '';
  const isGroup = jid.endsWith('@g.us');
  const fromMe  = msg.key.fromMe;

  const sender = isGroup
    ? (msg.key.participant || jid)
    : fromMe
      ? (sock.user?.id || jid)
      : jid;

  const senderNumber = jidDecode(cleanJid(sender))?.user
    || cleanJid(sender).split('@')[0];

  const ownerNum       = normalizeNum(config.OWNER_NUMBER);
  const isOwner        = normalizeNum(senderNumber) === ownerNum;

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

// ─────────────────────────────────────────────────
//  MAIN MESSAGE HANDLER
// ─────────────────────────────────────────────────
export async function messageHandler(sock, msg, userId) {
  if (!msg.message) return;

  const msgType    = Object.keys(msg.message)[0];
  const SKIP_TYPES = [
    'protocolMessage', 'senderKeyDistributionMessage',
    'pollUpdateMessage', 'reactionMessage',
  ];
  if (SKIP_TYPES.includes(msgType)) return;
  if (msg.key.remoteJid === 'status@broadcast') return;

  const ctx      = buildContext(sock, msg, userId);
  const settings = (await dbGet(`settings:${userId}`)) || {};

  // ── Cache every non-fromMe message for antidelete / antiedit ──
  if (!msg.key.fromMe) {
    msgCache.set(msg.key.id, {
      text:       ctx.body,
      jid:        ctx.jid,
      sender:     ctx.sender,
      name:       ctx.pushName,
      time:       Date.now(),
      rawMessage: msg.message,   // kept for media resend
    });
    if (msgCache.size > 500) {
      const oldest = msgCache.keys().next().value;
      msgCache.delete(oldest);
    }
  }

  // ── Ignore list ──────────────────────────────────
  const ignoreList = (settings.ignoreList || []).map(normalizeNum);
  if (!ctx.isOwner && ignoreList.includes(normalizeNum(ctx.senderNumber))) return;

  // ── Auto-read ────────────────────────────────────
  if (settings.autoread !== false) {
    await sock.readMessages([msg.key]).catch(() => {});
  }

  // ── Anti-bug: drop oversized / malformed messages ──
  if (settings.antibug && ctx.body.length > 4000) return;

  // ── Anti view-once: re-send as normal media ───────
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
        await sock.sendMessage(ctx.jid, {
          [mediaType === 'image' ? 'image' : 'video']: Buffer.concat(chunks),
          caption: `🔓 *Anti View-Once* — From: ${ctx.pushName}`,
        });
      } catch {}
    }
  }

  // ── Auto react to incoming messages ───────────────
  const EMOJIS = ['❤️','🔥','👍','😂','🎉','💯','⚡','🙌'];
  if (settings.autoreact && !msg.key.fromMe) {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    await ctx.react(emoji).catch(() => {});
  }

  // ── Chatbot: AI reply to every non-command message ──
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

  // ── Private mode ─────────────────────────────────
  if (config.MODE === 'private' && !ctx.isOwner) return;

  // ── Auto-typing presence ──────────────────────────
  if (settings.autotyping !== false) {
    const presence = settings.autorecord ? 'recording' : 'composing';
    await sock.sendPresenceUpdate(presence, ctx.jid).catch(() => {});
  }

  const plugin = commands.get(ctx.command);
  if (!plugin) return;

  // ── Sudo check ────────────────────────────────────
  const sudoList       = (settings.sudoList || []).map(normalizeNum);
  const isSudo         = sudoList.includes(normalizeNum(ctx.senderNumber));
  const hasOwnerAccess = ctx.isOwner || isSudo;

  // ── Permission checks ─────────────────────────────
  if (plugin.owner && !hasOwnerAccess)
    return ctx.reply('❌ *Owner only command.*');
  if (plugin.group && !ctx.isGroup)
    return ctx.reply('❌ *This command only works inside a group.*');

  // ── Cooldown (skip for owner/sudo) ────────────────
  if (!hasOwnerAccess) {
    const wait = checkCooldown(ctx.senderNumber, ctx.command);
    if (wait > 0)
      return ctx.reply(`⏳ Wait *${wait}s* before using this command again.`);
  }

  // ── Track stats ──────────────────────────────────
  const session = sessions.get(userId);
  if (session) session.commandCount++;

  // ── Run plugin ────────────────────────────────────
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
//  Receives messages from status@broadcast
// ─────────────────────────────────────────────────
export async function statusHandler(sock, msg, userId) {
  const settings     = (await dbGet(`settings:${userId}`)) || {};
  const sender       = msg.key.participant || '';            // e.g. 254700000000@s.whatsapp.net
  const senderNum    = sender.split('@')[0];
  const hasMedia     = !!(msg.message?.imageMessage || msg.message?.videoMessage);
  const mediaTypeKey = msg.message?.imageMessage ? 'imageMessage' : 'videoMessage';
  const mediaType    = msg.message?.imageMessage ? 'image'        : 'video';

  // Caption extraction
  const caption = msg.message?.imageMessage?.caption
    || msg.message?.videoMessage?.caption
    || msg.message?.conversation
    || msg.message?.extendedTextMessage?.text
    || null;

  // ── FIX 1: Auto view status ──────────────────────
  // sock.readMessages does NOT work for statuses.
  // Must use sendReadReceipt with status@broadcast.
  if (settings.autoviewstatus && sender) {
    if (settings.statusDelay) {
      await new Promise(r => setTimeout(r, settings.statusDelay));
    }
    try {
      // Primary method — proper receipt for status
      await sock.sendReadReceipt('status@broadcast', sender, [msg.key.id]);
    } catch {
      // Fallback
      await sock.readMessages([msg.key]).catch(() => {});
    }
    console.log(`  👀  Viewed status from ${senderNum}`);
  }

  // ── FIX 2: Auto react to status ──────────────────
  // sock.user.id has ":0" device suffix — must clean it.
  if (settings.autoreactstatus && sender) {
    const emoji = settings.statusEmoji || '🔥';
    // Clean own JID: "254700000000:0@s.whatsapp.net" → "254700000000@s.whatsapp.net"
    const myJid = cleanJid(sock.user?.id || '');
    try {
      await sock.sendMessage(
        'status@broadcast',
        { react: { text: emoji, key: msg.key } },
        { statusJidList: [sender, myJid].filter(j => j && j.includes('@')) }
      );
      console.log(`  🔥  Reacted to status from ${senderNum} with ${emoji}`);
    } catch (e) {
      console.error(`  ⚠️   Status react failed:`, e.message);
    }
  }

  // ── Auto save status media → owner DM ────────────
  if (settings.autosavestatus && hasMedia) {
    try {
      const stream = await downloadContentFromMessage(
        msg.message[mediaTypeKey], mediaType
      );
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buf      = Buffer.concat(chunks);
      const ownerJid = normalizeNum(config.OWNER_NUMBER) + '@s.whatsapp.net';
      let saveCaption = `💾 *Status Saved*\n👤 From: ${senderNum}`;
      if (caption) saveCaption += `\n📝 ${caption}`;
      await sock.sendMessage(ownerJid, {
        [mediaType]: buf,
        caption: saveCaption,
      });
      console.log(`  💾  Status saved from ${senderNum}`);
    } catch (e) {
      console.error(`  ❌  Save status failed:`, e.message);
    }
  }

  // ── Anti-delete status: save every status on receipt ──
  // WhatsApp does NOT emit a "status deleted" event.
  // The only way to protect is to save when it arrives.
  if (settings.antideletestatus && hasMedia) {
    try {
      const stream = await downloadContentFromMessage(
        msg.message[mediaTypeKey], mediaType
      );
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buf      = Buffer.concat(chunks);
      const ownerJid = normalizeNum(config.OWNER_NUMBER) + '@s.whatsapp.net';
      let adc = `🛡️ *Anti-Delete Status*\n👤 From: ${senderNum}\n⏰ Saved on receipt`;
      if (caption) adc += `\n📝 ${caption}`;
      await sock.sendMessage(ownerJid, { [mediaType]: buf, caption: adc });
      console.log(`  🛡️   Anti-delete status saved from ${senderNum}`);
    } catch (e) {
      console.error(`  ❌  Anti-delete status failed:`, e.message);
    }
  }
}

// ─────────────────────────────────────────────────
//  ANTI-DELETE HANDLER  (messages.delete event)
//  Handles GROUP "delete for everyone" events.
//  DM deletions come through messages.update — see below.
// ─────────────────────────────────────────────────
export async function deletedMsgHandler(sock, item, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  if (!settings.antidelete) return;

  const keys = item.keys || [];
  for (const key of keys) {
    const cached = msgCache.get(key.id);
    if (!cached) continue;
    try {
      const label = key.fromMe ? '(you deleted)' : cached.name;
      await sock.sendMessage(cached.jid, {
        text: `🛡️ *Anti-Delete*\n👤 ${label} deleted:\n\n${cached.text || '[media / no text]'}`,
      });
    } catch {}
  }
}

// ─────────────────────────────────────────────────
//  MESSAGES.UPDATE HANDLER
//  Handles TWO things:
//  1. DM "delete for everyone" → protocolMessage type REVOKE (0)
//  2. Message edits → update.update.message present
// ─────────────────────────────────────────────────
export async function editedMsgHandler(sock, updates, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};

  for (const update of updates) {
    // ── FIX 3: DM antidelete via protocol message ──
    // When someone deletes a DM for everyone, WhatsApp sends
    // a protocolMessage with type === 0 (REVOKE) inside messages.update.
    // The messages.delete event does NOT fire for DMs.
    const proto = update.update?.message?.protocolMessage;
    if (proto?.type === 0) {
      if (!settings.antidelete) continue;
      // The key of the deleted message is inside proto.key
      const deletedId  = proto.key?.id;
      const cached     = deletedId ? msgCache.get(deletedId) : null;
      if (!cached) continue;
      try {
        await sock.sendMessage(cached.jid, {
          text: `🛡️ *Anti-Delete (DM)*\n👤 ${cached.name} deleted:\n\n${cached.text || '[media / no text]'}`,
        });
      } catch {}
      continue; // don't fall through to edit handler
    }

    // ── Anti-edit ────────────────────────────────
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

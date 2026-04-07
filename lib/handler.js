// ═══════════════════════════════════════════════════
//  RIOT MD - MESSAGE HANDLER  (fixed fromMe + settings)
// ═══════════════════════════════════════════════════

import { jidDecode } from '@whiskeysockets/baileys';
import { config }    from '../config.js';
import { commands, checkCooldown } from './commands.js';
import { sessions }  from './session.js';
import { dbGet }     from './database.js';

// ── Extract text from any message type ────────────
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

// ── Build rich context object for plugins ─────────
function buildContext(sock, msg, userId) {
  const jid      = msg.key.remoteJid || '';
  const isGroup  = jid.endsWith('@g.us');
  const fromMe   = msg.key.fromMe;

  // For group msgs the participant field holds the real sender
  // For fromMe msgs in groups, participant is our own JID
  const sender = isGroup
    ? (msg.key.participant || msg.pushName || jid)
    : fromMe ? (sock.user?.id || jid)   // own number in DM
             : jid;

  const senderNumber = jidDecode(sender)?.user
    || sender.split('@')[0]
    || sender.split(':')[0];

  const ownerNum  = config.OWNER_NUMBER.replace(/\D/g, '');
  const isOwner   = senderNumber === ownerNum
    || senderNumber === ownerNum.replace(/^0/, '254');

  const body   = extractText(msg);
  const prefix = config.PREFIX;
  const isCmd  = body.startsWith(prefix);
  const [rawCmd = '', ...argArr] = isCmd
    ? body.slice(prefix.length).trim().split(/\s+/)
    : ['', ...body.split(/\s+/)];

  const command = rawCmd.toLowerCase();
  const args    = argArr;
  const text    = args.join(' ');

  const reply = (content) => {
    if (typeof content === 'string')
      return sock.sendMessage(jid, { text: content }, { quoted: msg });
    return sock.sendMessage(jid, content, { quoted: msg });
  };

  const react = (emoji) =>
    sock.sendMessage(jid, { react: { text: emoji, key: msg.key } });

  return {
    sock, msg, userId, jid, sender, senderNumber,
    isGroup, isOwner, fromMe, isCmd, command,
    args, text, body, prefix, reply, react,
    pushName: msg.pushName || senderNumber,
  };
}

// ── MAIN HANDLER ──────────────────────────────────
export async function messageHandler(sock, msg, userId) {
  if (!msg.message) return;

  // Skip protocol / system messages
  const msgType = Object.keys(msg.message)[0];
  const SKIP    = ['protocolMessage','senderKeyDistributionMessage',
                   'reactionMessage','pollUpdateMessage'];
  if (SKIP.includes(msgType)) return;

  // Skip status broadcast (handled separately by status handler)
  if (msg.key.remoteJid === 'status@broadcast') return;

  const ctx = buildContext(sock, msg, userId);

  // ── Load per-session settings from DB ──
  const settings = (await dbGet(`settings:${userId}`)) || {};

  // Auto-read (respects toggleable setting)
  if (settings.autoread !== false && config.AUTO_READ) {
    await sock.readMessages([msg.key]).catch(() => {});
  }

  // Auto-typing (respects toggleable setting)
  if (settings.autotyping !== false && config.AUTO_TYPING && ctx.isCmd) {
    await sock.sendPresenceUpdate('composing', ctx.jid).catch(() => {});
  }

  if (!ctx.isCmd) return;

  // In private mode only owner can use commands
  if (config.MODE === 'private' && !ctx.isOwner) return;

  const plugin = commands.get(ctx.command);
  if (!plugin) return;

  // ── Permission checks ──
  if (plugin.owner && !ctx.isOwner) {
    return ctx.reply('❌ *Owner only command.*');
  }
  if (plugin.group && !ctx.isGroup) {
    return ctx.reply('❌ *This command only works inside a group.*');
  }

  // ── Cooldown (skip for owner) ──
  if (!ctx.isOwner) {
    const wait = checkCooldown(ctx.senderNumber, ctx.command);
    if (wait > 0) {
      return ctx.reply(`⏳ Wait *${wait}s* before using this command again.`);
    }
  }

  // ── Track command count ──
  const session = sessions.get(userId);
  if (session) session.commandCount++;

  // ── Execute ──
  try {
    await ctx.react('⚙️');
    await plugin.run(ctx);
  } catch (err) {
    console.error(`  ❌  Command error [.${ctx.command}]:`, err.message);
    await ctx.reply(`❌ An error occurred:\n${err.message}`);
  }
}

// ── STATUS HANDLER ────────────────────────────────
export async function statusHandler(sock, msg, userId) {
  const settings = (await dbGet(`settings:${userId}`)) || {};
  const jid      = msg.key.remoteJid;   // 'status@broadcast'
  const sender   = msg.key.participant;

  // Auto view status
  if (settings.autoviewstatus) {
    await sock.readMessages([msg.key]).catch(() => {});
  }

  // Auto react to status
  if (settings.autoreactstatus) {
    const emoji = settings.statusEmoji || '🔥';
    await sock.sendMessage(jid, {
      react: { text: emoji, key: msg.key }
    }, { statusJidList: [sender] }).catch(() => {});
  }

  // Auto save status media
  if (settings.autosavestatus && msg.message) {
    const type = Object.keys(msg.message)[0];
    if (['imageMessage','videoMessage'].includes(type)) {
      // Notify owner a status was saved
      const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
      await sock.sendMessage(ownerJid, {
        text: `📥 *Status saved*\nFrom: ${sender?.split('@')[0]}`
      }).catch(() => {});
    }
  }
}

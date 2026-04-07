// ═══════════════════════════════════════════════════
//  RIOT MD - MESSAGE HANDLER
//  Fixed: linked/owner number can now run commands
// ═══════════════════════════════════════════════════

import { getContentType, jidDecode } from '@whiskeysockets/baileys';
import { config } from '../config.js';
import { commands, checkCooldown } from './commands.js';
import { sessions } from './session.js';

// ── In-memory settings store (toggle on/off) ──────
export const botSettings = {
  autoread:         config.AUTO_READ    ?? true,
  autotyping:       config.AUTO_TYPING  ?? true,
  autoviewstatus:   false,
  autoreactstatus:  false,
  antidelete:       false,
  antideletestatus: false,
};

// ──────────────────────────────────────────────────
//  Extract text from any message type
// ──────────────────────────────────────────────────
function extractText(msg) {
  const m = msg.message;
  if (!m) return '';
  const inner = m.ephemeralMessage?.message || m.viewOnceMessage?.message || m;
  return (
    inner.conversation                                ||
    inner.extendedTextMessage?.text                   ||
    inner.imageMessage?.caption                       ||
    inner.videoMessage?.caption                       ||
    inner.buttonsResponseMessage?.selectedDisplayText ||
    inner.listResponseMessage?.title                  ||
    ''
  );
}

// ──────────────────────────────────────────────────
//  Normalise phone number for comparison
// ──────────────────────────────────────────────────
function normalise(num = '') {
  num = num.replace(/[^0-9]/g, '');
  if (num.startsWith('0')) num = '254' + num.slice(1);
  return num;
}

// ──────────────────────────────────────────────────
//  Build context object for plugins
// ──────────────────────────────────────────────────
function buildContext(sock, msg, userId) {
  const jid     = msg.key.remoteJid || '';
  const isGroup = jid.endsWith('@g.us');
  const fromMe  = msg.key.fromMe;

  // fromMe=true means this WhatsApp account sent it (linked number OR bot itself)
  // We use sock.user.id so the owner number check works correctly
  let sender;
  if (fromMe) {
    sender = sock.user?.id || jid;
  } else {
    sender = isGroup ? (msg.key.participant || msg.pushName || jid) : jid;
  }

  const senderNumber = normalise(jidDecode(sender)?.user || sender.split('@')[0]);
  const ownerNumber  = normalise(config.OWNER_NUMBER);
  const isOwner      = senderNumber === ownerNumber;

  const body   = extractText(msg);
  const prefix = config.PREFIX;
  const isCmd  = body.startsWith(prefix);
  const [rawCmd, ...argArr] = isCmd
    ? body.slice(prefix.length).trim().split(/\s+/)
    : ['', ...body.split(/\s+/)];
  const command = rawCmd.toLowerCase();
  const args    = argArr;
  const text    = args.join(' ');

  const reply = (content) => {
    if (typeof content === 'string') {
      return sock.sendMessage(jid, { text: content }, { quoted: msg });
    }
    return sock.sendMessage(jid, content, { quoted: msg });
  };

  const react = (emoji) =>
    sock.sendMessage(jid, { react: { text: emoji, key: msg.key } });

  return {
    sock, msg, userId, jid, sender, senderNumber,
    isGroup, isOwner, fromMe, isCmd, command, args, text, body,
    prefix, reply, react,
    pushName: msg.pushName || senderNumber,
    settings: botSettings,
  };
}

// ──────────────────────────────────────────────────
//  Main handler  (called per message)
// ──────────────────────────────────────────────────
export async function messageHandler(sock, msg, userId) {
  if (!msg.message) return;

  // Handle status broadcasts separately
  if (msg.key.remoteJid === 'status@broadcast') {
    await handleStatusBroadcast(sock, msg);
    return;
  }

  // ── LINKED NUMBER FIX ───────────────────────────
  // fromMe=true covers BOTH the bot's own outgoing messages AND
  // messages typed by the linked/owner number on their phone.
  // We allow fromMe messages through ONLY when they start with
  // the command prefix — this catches owner commands while
  // ignoring the bot's own replies (which never start with prefix).
  if (msg.key.fromMe) {
    const body = extractText(msg);
    if (!body.startsWith(config.PREFIX)) return;
  }

  const ctx = buildContext(sock, msg, userId);

  // Auto-read
  if (botSettings.autoread) {
    await sock.readMessages([msg.key]).catch(() => {});
  }

  // Store for anti-delete
  if (botSettings.antidelete) {
    storeMessage(msg);
  }

  if (!ctx.isCmd) return;

  const plugin = commands.get(ctx.command);
  if (!plugin) return;

  // Auto-typing
  if (botSettings.autotyping) {
    await sock.sendPresenceUpdate('composing', ctx.jid).catch(() => {});
  }

  // Permission checks
  if (plugin.owner && !ctx.isOwner) {
    return ctx.reply('❌ *Owner only command.*');
  }
  if (plugin.group && !ctx.isGroup) {
    return ctx.reply('❌ *This command works in groups only.*');
  }

  // Cooldown (owner is exempt)
  if (!ctx.isOwner) {
    const wait = checkCooldown(ctx.senderNumber, ctx.command);
    if (wait > 0) {
      return ctx.reply(`⏳ Slow down! Wait *${wait}s* before using this command again.`);
    }
  }

  // Track count
  const session = sessions.get(userId);
  if (session) session.commandCount++;

  // Execute
  try {
    await ctx.react('⚙️');
    await plugin.run(ctx);
    if (botSettings.autotyping) {
      await sock.sendPresenceUpdate('paused', ctx.jid).catch(() => {});
    }
  } catch (err) {
    console.error(`  ❌  Command error [.${ctx.command}]:`, err.message);
    await ctx.reply(`❌ An error occurred: ${err.message}`);
  }
}

// ──────────────────────────────────────────────────
//  Status broadcast handler
// ──────────────────────────────────────────────────
const STATUS_EMOJIS = ['🔥','❤️','😍','💯','👏','🎉','😂','🤩','✨','💪'];

async function handleStatusBroadcast(sock, msg) {
  if (botSettings.autoviewstatus) {
    await sock.readMessages([msg.key]).catch(() => {});
  }
  if (botSettings.autoreactstatus) {
    const emoji = STATUS_EMOJIS[Math.floor(Math.random() * STATUS_EMOJIS.length)];
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: emoji, key: msg.key },
    }).catch(() => {});
  }
}

// ──────────────────────────────────────────────────
//  Anti-delete message store (last 200 messages)
// ──────────────────────────────────────────────────
const deletedStore = new Map();

function storeMessage(msg) {
  deletedStore.set(msg.key.id, msg);
  if (deletedStore.size > 200) {
    deletedStore.delete(deletedStore.keys().next().value);
  }
}

export function getDeletedMessage(id) {
  return deletedStore.get(id) || null;
    }

//  RIOT MD - SESSION MANAGER
// ═══════════════════════════════════════════════════

import { makeWASocket, useMultiFileAuthState, DisconnectReason,
         fetchLatestBaileysVersion, makeCacheableSignalKeyStore }
  from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs-extra';
import path from 'path';
import { EventEmitter } from 'events';
import { config } from '../config.js';
import { messageHandler, statusHandler, deletedMsgHandler, editedMsgHandler } from './handler.js';

const logger = pino({ level: 'silent' });

// ── Active sessions map: userId → { socket, status, number } ──
export const sessions = new Map();
export const sessionEvents = new EventEmitter();

// ──────────────────────────────────────────────────
//  Create / restore a session
// ──────────────────────────────────────────────────
export async function createSession(userId, phoneNumber = null, pairingMode = true) {
  if (sessions.has(userId)) await removeSession(userId);

  const sessionPath = path.join(config.SESSION_DIR, userId);
  await fs.ensureDir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ['RIOT MD', 'Chrome', '120.0.0'],
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async () => ({ conversation: 'RIOT MD' }),
  });

  const session = {
    sock,
    userId,
    phoneNumber,
    status: 'connecting',
    pairingCode: null,
    connectedAt: null,
    messageCount: 0,
    commandCount: 0,
  };

  sessions.set(userId, session);

  // ── Request pairing code if first-time ──
  if (pairingMode && !state.creds.registered && phoneNumber) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
      const formatted = code.match(/.{1,4}/g)?.join('-') || code;
      session.pairingCode = formatted;
      sessionEvents.emit('pairingCode', { userId, code: formatted, phoneNumber });
      console.log(`\n  ┌─────────────────────────────────────┐`);
      console.log(`  │       RIOT MD PAIRING SYSTEM        │`);
      console.log(`  ├─────────────────────────────────────┤`);
      console.log(`  │  Number : ${phoneNumber.padEnd(26)}│`);
      console.log(`  │  Code   : ${formatted.padEnd(26)}│`);
      console.log(`  │  Status : Waiting for verification  │`);
      console.log(`  └─────────────────────────────────────┘\n`);
    } catch (e) {
      sessionEvents.emit('error', { userId, error: e.message });
    }
  }

  // ── Connection update handler ──
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'open') {
      session.status    = 'connected';
      session.connectedAt = Date.now();
      session.pairingCode = null;
      await saveCreds();

      // ── Auto-set owner to the linked number ──
      const myJid    = sock.user?.id || '';
      const myNumber = myJid.split(':')[0].split('@')[0];
      if (myNumber && myNumber !== config.OWNER_NUMBER) {
        const { dbSet } = await import('./database.js');
        await dbSet('bot:ownerNumber', myNumber);
        config.OWNER_NUMBER = myNumber;
        console.log(`  👑  Owner auto-set to: ${myNumber}`);
      }

      sessionEvents.emit('connected', { userId, phoneNumber });
      console.log(`  ✅  Session [${userId}] connected → ${phoneNumber || 'restored'}`);
    }

    if (connection === 'close') {
      const code    = (lastDisconnect?.error instanceof Boom)
                        ? lastDisconnect.error.output?.statusCode : 500;
      const loggedOut = code === DisconnectReason.loggedOut;

      session.status = loggedOut ? 'logged_out' : 'reconnecting';
      sessionEvents.emit('disconnected', { userId, code, loggedOut });

      if (loggedOut) {
        console.log(`  ⚠️   Session [${userId}] logged out.`);
        await removeSession(userId);
      } else {
        console.log(`  🔄  Session [${userId}] reconnecting… (code ${code})`);
        setTimeout(() => createSession(userId, phoneNumber, false), 5000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Anti-delete ──
  sock.ev.on('messages.delete', (item) =>
    deletedMsgHandler(sock, item, userId).catch(() => {})
  );

  // ── Anti-edit ──
  sock.ev.on('messages.update', (updates) =>
    editedMsgHandler(sock, updates, userId).catch(() => {})
  );
  // ── Welcome / Goodbye on group membership changes ──
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    const { getGroup } = await import('./database.js');
    const g = await getGroup(id).catch(() => ({}));
    try {
      const meta = await sock.groupMetadata(id).catch(() => ({ subject: 'this group', participants: [] }));
      for (const participant of participants) {
        const num  = participant.split('@')[0];
        const tag  = `@${num}`;
        if (action === 'add' && g.welcome) {
          const msg = (g.welcomeMsg || 'Welcome to @group, @user! 🎉')
            .replace('@user',  tag)
            .replace('@group', meta.subject)
            .replace('@count', meta.participants.length);
          await sock.sendMessage(id, { text: msg, mentions: [participant] });
        }
        if ((action === 'remove' || action === 'leave') && g.goodbye) {
          const msg = (g.goodbyeMsg || 'Goodbye @user! 👋')
            .replace('@user',  tag)
            .replace('@group', meta.subject)
            .replace('@count', meta.participants.length);
          await sock.sendMessage(id, { text: msg, mentions: [participant] });
        }
      }
    } catch {}
  });


  // ── Anti-delete: re-send deleted messages ──
  const msgCache = new Map(); // key → message
  sock.ev.on('messages.upsert', async (m) => {
    for (const msg of m.messages) {
      if (msg.message && msg.key.remoteJid !== 'status@broadcast') {
        msgCache.set(msg.key.id, { msg, jid: msg.key.remoteJid });
        if (msgCache.size > 500) {
          const oldest = msgCache.keys().next().value;
          msgCache.delete(oldest);
        }
      }
    }
  });

  sock.ev.on('messages.delete', async (item) => {
    const settings = (await import('../lib/database.js').then(m => m.dbGet(`settings:${userId}`))) || {};
    if (!settings.antidelete) return;
    const keys = item.keys || [];
    for (const key of keys) {
      const cached = msgCache.get(key.id);
      if (!cached) continue;
      const { msg, jid } = cached;
      try {
        const text = msg.message?.conversation
          || msg.message?.extendedTextMessage?.text
          || '[media/unsupported message]';
        const sender = key.participant || jid.split('@')[0];
        await sock.sendMessage(jid, {
          text: `🛡️ *Anti-Delete*\n👤 @${sender}\n\n${text}`,
          mentions: [key.participant].filter(Boolean),
        });
      } catch {}
    }
  });

  // ── Anti-call: reject incoming calls ──
  sock.ev.on('call', async (calls) => {
    const settings = (await import('../lib/database.js').then(m => m.dbGet(`settings:${userId}`))) || {};
    if (!settings.anticall) return;
    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from).catch(() => {});
        await sock.sendMessage(call.from, {
          text: '📵 Sorry, I cannot accept calls. Please send a text message.',
        }).catch(() => {});
      }
    }
  });

  // ── Always-online presence ──
  setInterval(async () => {
    const settings = (await import('../lib/database.js').then(m => m.dbGet(`settings:${userId}`))) || {};
    if (settings.alwaysonline && session.status === 'connected') {
      await sock.sendPresenceUpdate('available').catch(() => {});
    }
  }, 30000);


  // ── Pass messages to handler ──
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify' && m.type !== 'append') return;
    session.messageCount++;
    for (const msg of m.messages) {
      try {
        if (msg.key.remoteJid === 'status@broadcast') {
          await statusHandler(sock, msg, userId);
        } else {
          await messageHandler(sock, msg, userId);
        }
      } catch (e) {
        console.error(`Handler error [${userId}]:`, e.message);
      }
    }
  });

  return session;
}

// ──────────────────────────────────────────────────
//  Remove session
// ──────────────────────────────────────────────────
export async function removeSession(userId) {
  const session = sessions.get(userId);
  if (session?.sock) {
    try { await session.sock.logout(); } catch {}
    try { session.sock.end(); } catch {}
  }
  sessions.delete(userId);
  sessionEvents.emit('removed', { userId });
}

// ──────────────────────────────────────────────────
//  Restore all persisted sessions on startup
// ──────────────────────────────────────────────────
export async function restoreAllSessions() {
  await fs.ensureDir(config.SESSION_DIR);
  const dirs = await fs.readdir(config.SESSION_DIR);
  let restored = 0;
  for (const userId of dirs) {
    const creds = path.join(config.SESSION_DIR, userId, 'creds.json');
    if (await fs.pathExists(creds)) {
      await createSession(userId, null, false);
      restored++;
    }
  }
  return restored;
}

// ──────────────────────────────────────────────────
//  Stats helper
// ──────────────────────────────────────────────────
export function getSessionStats() {
  const all = [...sessions.values()];
  return {
    total:        all.length,
    connected:    all.filter(s => s.status === 'connected').length,
    connecting:   all.filter(s => s.status === 'connecting').length,
    reconnecting: all.filter(s => s.status === 'reconnecting').length,
    messages:     all.reduce((a, s) => a + s.messageCount, 0),
    commands:     all.reduce((a, s) => a + s.commandCount, 0),
  };
}
// ═══════════════════════════════════════════════════
//  RIOT MD - SESSION MANAGER  (merged & fixed)
//  ✅ Pairing fix (no browser field, live creds check)
//  ✅ Auto-owner: linked number becomes owner on connect
//  ✅ Welcome / Goodbye on group membership changes
//  ✅ Anti-delete  (toggle via .antidelete)
//  ✅ Anti-call    (toggle via .anticall)
//  ✅ Always-online presence (toggle via .alwaysonline)
//  ✅ Status view / react (handled via botSettings)
// ═══════════════════════════════════════════════════

import {
  makeWASocket, useMultiFileAuthState, DisconnectReason,
  fetchLatestBaileysVersion, makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys';
import { Boom }         from '@hapi/boom';
import pino             from 'pino';
import fs               from 'fs-extra';
import path             from 'path';
import { EventEmitter } from 'events';
import { config }       from '../config.js';
import { messageHandler, botSettings } from './handler.js';
import { dbGet, dbSet, getGroup }      from './database.js';

const logger = pino({ level: 'silent' });

// ── Active sessions map ────────────────────────────
export const sessions      = new Map();
export const sessionEvents = new EventEmitter();

// ── Per-session message cache for anti-delete ─────
// key.id → { msg, jid }   (capped at 500 per session)
const msgCaches = new Map();   // userId → Map

// ──────────────────────────────────────────────────
//  Helper: get (or create) per-session cache
// ──────────────────────────────────────────────────
function getCache(userId) {
  if (!msgCaches.has(userId)) msgCaches.set(userId, new Map());
  return msgCaches.get(userId);
}

// ──────────────────────────────────────────────────
//  Helper: load settings for a session from DB
// ──────────────────────────────────────────────────
async function getSettings(userId) {
  return (await dbGet(`settings:${userId}`)) || {};
}

// ──────────────────────────────────────────────────
//  Create / restore a session
// ──────────────────────────────────────────────────
export async function createSession(userId, phoneNumber = null, pairingMode = true) {
  if (sessions.has(userId)) await removeSession(userId);

  const sessionPath = path.join(config.SESSION_DIR, userId);
  await fs.ensureDir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  // ────────────────────────────────────────────────
  //  Socket creation
  //  ⚠️  NO `browser` field — pairing codes only work
  //      with mobile-type sessions. Chrome/Web browser
  //      silently blocks requestPairingCode().
  // ────────────────────────────────────────────────
  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal:              false,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, logger),
    },
    markOnlineOnConnect:            true,
    generateHighQualityLinkPreview: true,
    syncFullHistory:                false,
    shouldIgnoreJid:                () => false,
    getMessage: async () => ({ conversation: 'RIOT MD' }),
  });

  const session = {
    sock,
    userId,
    phoneNumber,
    status:       'connecting',
    pairingCode:  null,
    connectedAt:  null,
    messageCount: 0,
    commandCount: 0,
  };
  sessions.set(userId, session);

  // ────────────────────────────────────────────────
  //  Pairing code request (first-time / not yet registered)
  //  ✅ Use sock.authState.creds (live) NOT state.creds (stale snapshot)
  //  ✅ 3 000 ms delay — WA needs time before accepting the request
  // ────────────────────────────────────────────────
  if (pairingMode && !sock.authState.creds.registered && phoneNumber) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const code      = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
      const formatted = code.match(/.{1,4}/g)?.join('-') || code;
      session.pairingCode = formatted;
      sessionEvents.emit('pairingCode', { userId, code: formatted, phoneNumber });
      console.log(`\n  ┌─────────────────────────────────────┐`);
      console.log(`  │       RIOT MD PAIRING SYSTEM        │`);
      console.log(`  ├─────────────────────────────────────┤`);
      console.log(`  │  Number : ${phoneNumber.padEnd(26)}│`);
      console.log(`  │  Code   : ${formatted.padEnd(26)}│`);
      console.log(`  │  Status : Waiting for verification  │`);
      console.log(`  └─────────────────────────────────────┘\n`);
    } catch (e) {
      console.error(`  ❌  Pairing error [${userId}]:`, e.message);
      sessionEvents.emit('error', { userId, error: e.message });
    }
  }

  // ────────────────────────────────────────────────
  //  Connection update
  // ────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      session.status      = 'connected';
      session.connectedAt = Date.now();
      session.pairingCode = null;
      await saveCreds();

      // ── AUTO-OWNER DETECTION ──────────────────────
      // When the bot links for the first time, the WhatsApp
      // number that just connected IS the owner. Auto-save it
      // so commands work immediately without manual config.
      try {
        const myJid    = sock.user?.id || '';
        // JID format: "2547XXXXXXXX:XX@s.whatsapp.net"
        const myNumber = myJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '');
        if (myNumber && myNumber !== config.OWNER_NUMBER) {
          config.OWNER_NUMBER = myNumber;          // update in-memory
          await dbSet('bot:ownerNumber', myNumber); // persist to DB
          console.log(`  👑  Owner auto-detected & saved: ${myNumber}`);
        }
      } catch (e) {
        console.error(`  ⚠️   Owner auto-detect failed:`, e.message);
      }

      sessionEvents.emit('connected', { userId, phoneNumber });
      console.log(`  ✅  Session [${userId}] connected → ${phoneNumber || 'restored'}`);
    }

    if (connection === 'close') {
      const code      = (lastDisconnect?.error instanceof Boom)
                          ? lastDisconnect.error.output?.statusCode : 500;
      const loggedOut = code === DisconnectReason.loggedOut;

      session.status = loggedOut ? 'logged_out' : 'reconnecting';
      sessionEvents.emit('disconnected', { userId, code, loggedOut });

      if (loggedOut) {
        console.log(`  ⚠️   Session [${userId}] logged out.`);
        await removeSession(userId);
      } else {
        console.log(`  🔄  Session [${userId}] reconnecting… (code ${code})`);
        setTimeout(() => createSession(userId, phoneNumber, false), 5000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ────────────────────────────────────────────────
  //  Message cache (feeds anti-delete)
  // ────────────────────────────────────────────────
  const cache = getCache(userId);

  sock.ev.on('messages.upsert', async (m) => {
    // Cache every non-status message for anti-delete
    for (const msg of m.messages) {
      if (msg.message && msg.key.remoteJid !== 'status@broadcast') {
        cache.set(msg.key.id, { msg, jid: msg.key.remoteJid });
        if (cache.size > 500) cache.delete(cache.keys().next().value);
      }
    }

    // Route to message handler
    if (m.type !== 'notify' && m.type !== 'append') return;
    session.messageCount++;
    for (const msg of m.messages) {
      try {
        await messageHandler(sock, msg, userId);
      } catch (e) {
        console.error(`  ❌  Handler error [${userId}]:`, e.message);
      }
    }
  });

  // ────────────────────────────────────────────────
  //  Anti-delete — re-send deleted messages
  // ────────────────────────────────────────────────
  sock.ev.on('messages.delete', async (item) => {
    // Check BOTH the live botSettings toggle AND the DB setting
    const s = await getSettings(userId);
    if (!botSettings.antidelete && !s.antidelete) return;

    const keys = item.keys || [];
    for (const key of keys) {
      const cached = cache.get(key.id);
      if (!cached) continue;
      const { msg, jid } = cached;
      try {
        const body =
          msg.message?.conversation                    ||
          msg.message?.extendedTextMessage?.text       ||
          msg.message?.imageMessage?.caption           ||
          msg.message?.videoMessage?.caption           ||
          '[media / unsupported type]';
        const sender = (key.participant || jid).split('@')[0].split(':')[0];
        await sock.sendMessage(jid, {
          text:     `🛡️ *Anti-Delete Triggered*\n👤 Sender: @${sender}\n\n${body}`,
          mentions: [key.participant].filter(Boolean),
        });
      } catch {}
    }
  });

  // ────────────────────────────────────────────────
  //  Anti-edit — notify when a message is edited
  // ────────────────────────────────────────────────
  sock.ev.on('messages.update', async (updates) => {
    const s = await getSettings(userId);
    if (!s.antiedit) return;
    for (const { key, update } of updates) {
      if (!update.message) continue;
      const cached = cache.get(key.id);
      if (!cached) continue;
      const { msg, jid } = cached;
      try {
        const original =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          '[original not cached]';
        const sender = (key.participant || jid).split('@')[0].split(':')[0];
        await sock.sendMessage(jid, {
          text:     `✏️ *Message Edited*\n👤 @${sender}\n\n*Before:* ${original}`,
          mentions: [key.participant].filter(Boolean),
        });
      } catch {}
    }
  });

  // ────────────────────────────────────────────────
  //  Anti-call — reject incoming voice/video calls
  // ────────────────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    const s = await getSettings(userId);
    if (!botSettings.anticall && !s.anticall) return;
    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from).catch(() => {});
        await sock.sendMessage(call.from, {
          text: '📵 *Auto-Reject*\nSorry, I cannot accept calls. Please send a text message.',
        }).catch(() => {});
      }
    }
  });

  // ────────────────────────────────────────────────
  //  Welcome / Goodbye on group membership changes
  // ────────────────────────────────────────────────
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    const g = await getGroup(id).catch(() => ({}));
    try {
      const meta = await sock.groupMetadata(id).catch(() => ({
        subject: 'this group', participants: [],
      }));
      for (const participant of participants) {
        const num = participant.split('@')[0].split(':')[0];
        const tag = `@${num}`;
        if (action === 'add' && g.welcome) {
          const msg = (g.welcomeMsg || 'Welcome to @group, @user! 🎉')
            .replace('@user',  tag)
            .replace('@group', meta.subject)
            .replace('@count', String(meta.participants.length));
          await sock.sendMessage(id, { text: msg, mentions: [participant] });
        }
        if ((action === 'remove' || action === 'leave') && g.goodbye) {
          const msg = (g.goodbyeMsg || 'Goodbye, @user! 👋')
            .replace('@user',  tag)
            .replace('@group', meta.subject)
            .replace('@count', String(meta.participants.length));
          await sock.sendMessage(id, { text: msg, mentions: [participant] });
        }
      }
    } catch {}
  });

  // ────────────────────────────────────────────────
  //  Always-online presence heartbeat (every 30 s)
  // ────────────────────────────────────────────────
  const presenceInterval = setInterval(async () => {
    if (session.status !== 'connected') return;
    const s = await getSettings(userId);
    const presence = (botSettings.alwaysonline || s.alwaysonline)
      ? 'available'
      : 'unavailable';
    await sock.sendPresenceUpdate(presence).catch(() => {});
  }, 30000);

  // Clean up interval if session is removed
  sessionEvents.once('removed', ({ userId: uid }) => {
    if (uid === userId) clearInterval(presenceInterval);
  });

  return session;
}

// ──────────────────────────────────────────────────
//  Remove session
// ──────────────────────────────────────────────────
export async function removeSession(userId) {
  const session = sessions.get(userId);
  if (session?.sock) {
    try { await session.sock.logout(); } catch {}
    try { session.sock.end();          } catch {}
  }
  sessions.delete(userId);
  msgCaches.delete(userId);
  sessionEvents.emit('removed', { userId });
}

// ──────────────────────────────────────────────────
//  Restore all persisted sessions on startup
// ──────────────────────────────────────────────────
export async function restoreAllSessions() {
  await fs.ensureDir(config.SESSION_DIR);
  const dirs = await fs.readdir(config.SESSION_DIR);

  // Also restore saved owner number from DB
  const savedOwner = await dbGet('bot:ownerNumber').catch(() => null);
  if (savedOwner) {
    config.OWNER_NUMBER = savedOwner;
    console.log(`  👑  Owner restored from DB: ${savedOwner}`);
  }

  let restored = 0;
  for (const userId of dirs) {
    const creds = path.join(config.SESSION_DIR, userId, 'creds.json');
    if (await fs.pathExists(creds)) {
      await createSession(userId, null, false);
      restored++;
    }
  }
  return restored;
}

// ──────────────────────────────────────────────────
//  Stats helper
// ──────────────────────────────────────────────────
export function getSessionStats() {
  const all = [...sessions.values()];
  return {
    total:        all.length,
    connected:    all.filter(s => s.status === 'connected').length,
    connecting:   all.filter(s => s.status === 'connecting').length,
    reconnecting: all.filter(s => s.status === 'reconnecting').length,
    messages:     all.reduce((a, s) => a + s.messageCount, 0),
    commands:     all.reduce((a, s) => a + s.commandCount, 0),
  };
                             }

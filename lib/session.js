// ═══════════════════════════════════════════════════
//  RIOT MD  ·  SESSION MANAGER  — v3  ALL FIXES
//
//  Fix log:
//  ✅ messages.delete now routes status@broadcast keys
//     to deletedMsgHandler which checks statusCache
//     → sends deleted status to owner DM only when deleted
//  ✅ getMessage uses real msgCache for proper decryption
//  ✅ anticall sends custom message from settings.anticallMsg
//  ✅ auto-owner: linked number saved and restored from DB
//  ✅ always-online heartbeat every 30s
//  ✅ welcome / goodbye on group membership changes
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
import {
  messageHandler,
  statusHandler,
  deletedMsgHandler,
  editedMsgHandler,
  msgCache,
} from './handler.js';
import { dbGet, dbSet, getGroup } from './database.js';

const logger = pino({ level: 'silent' });

export const sessions      = new Map();
export const sessionEvents = new EventEmitter();

export async function createSession(userId, phoneNumber = null, pairingMode = true) {
  if (sessions.has(userId)) await removeSession(userId);

  const sessionPath = path.join(config.SESSION_DIR, userId);
  await fs.ensureDir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  // Use real message cache so Baileys can decrypt reply/forwarded messages
  const getMessage = async (key) => {
    const cached = msgCache.get(key.id);
    if (cached?.rawMessage) return cached.rawMessage;
    return { conversation: '' };
  };

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
    getMessage,
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

  // ── Pairing code ────────────────────────────────
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

  // ── Connection update ────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      session.status      = 'connected';
      session.connectedAt = Date.now();
      session.pairingCode = null;
      await saveCreds();

      // Auto-detect and save owner number
      try {
        const myJid    = sock.user?.id || '';
        const myNumber = myJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '');
        if (myNumber) {
          config.OWNER_NUMBER = myNumber;
          await dbSet('bot:ownerNumber', myNumber);
          console.log(`  👑  Owner auto-set: ${myNumber}`);
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
        console.log(`  🔄  Reconnecting [${userId}]… (code ${code})`);
        setTimeout(() => createSession(userId, phoneNumber, false), 5000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Route all incoming messages ──────────────────
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
        console.error(`  ❌  Handler error [${userId}]:`, e.message);
      }
    }
  });

  // ── messages.delete ──────────────────────────────
  // Handles:
  //   • Group "delete for everyone" (regular messages)
  //   • Status deletions (key.remoteJid === 'status@broadcast')
  //     → deletedMsgHandler checks statusCache and forwards to owner DM
  sock.ev.on('messages.delete', (item) =>
    deletedMsgHandler(sock, item, userId).catch(() => {})
  );

  // ── messages.update ──────────────────────────────
  // Handles DM antidelete (protocolMessage / stub type 1) + antiedit
  sock.ev.on('messages.update', (updates) =>
    editedMsgHandler(sock, updates, userId).catch(() => {})
  );

  // ── Anti-call ────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    const settings = (await dbGet(`settings:${userId}`)) || {};
    if (!settings.anticall) return;
    for (const call of calls) {
      if (call.status === 'offer') {
        await sock.rejectCall(call.id, call.from).catch(() => {});
        const msg = settings.anticallMsg
          || '📵 Sorry, I cannot accept calls. Please send a text message.';
        await sock.sendMessage(call.from, { text: msg }).catch(() => {});
        console.log(`  📵  Call rejected from ${call.from}`);
      }
    }
  });

  // ── Welcome / Goodbye ────────────────────────────
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
          const text = (g.welcomeMsg || 'Welcome to @group, @user! 🎉')
            .replace('@user',  tag)
            .replace('@group', meta.subject)
            .replace('@count', String(meta.participants.length));
          await sock.sendMessage(id, { text, mentions: [participant] });
        }
        if ((action === 'remove' || action === 'leave') && g.goodbye) {
          const text = (g.goodbyeMsg || 'Goodbye, @user! 👋')
            .replace('@user',  tag)
            .replace('@group', meta.subject)
            .replace('@count', String(meta.participants.length));
          await sock.sendMessage(id, { text, mentions: [participant] });
        }
      }
    } catch {}
  });

  // ── Always-online heartbeat ──────────────────────
  const presenceInterval = setInterval(async () => {
    if (session.status !== 'connected') return;
    const settings = (await dbGet(`settings:${userId}`)) || {};
    await sock.sendPresenceUpdate(
      settings.alwaysonline ? 'available' : 'unavailable'
    ).catch(() => {});
  }, 30000);

  sessionEvents.once('removed', ({ userId: uid }) => {
    if (uid === userId) clearInterval(presenceInterval);
  });

  return session;
}

export async function removeSession(userId) {
  const session = sessions.get(userId);
  if (session?.sock) {
    try { await session.sock.logout(); } catch {}
    try { session.sock.end();          } catch {}
  }
  sessions.delete(userId);
  sessionEvents.emit('removed', { userId });
}

export async function restoreAllSessions() {
  await fs.ensureDir(config.SESSION_DIR);

  // Restore saved owner number BEFORE any sessions load
  try {
    const savedOwner = await dbGet('bot:ownerNumber');
    if (savedOwner) {
      config.OWNER_NUMBER = savedOwner;
      console.log(`  👑  Owner restored from DB: ${savedOwner}`);
    }
  } catch {}

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

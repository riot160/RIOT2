// ═══════════════════════════════════════════════════
//  RIOT MD - SESSION MANAGER  (clean single copy)
//  ✅ Pairing: no browser field, live creds, 3000ms
//  ✅ Auto-owner: linked number saved as owner on connect
//  ✅ Owner restored from DB on every restart
//  ✅ Anti-delete / Anti-edit via handler exports
//  ✅ Anti-call, Always-online, Welcome/Goodbye
//  ✅ Status view/react/save via statusHandler
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
} from './handler.js';
import { dbGet, dbSet, getGroup } from './database.js';

const logger = pino({ level: 'silent' });

// ── Active sessions map ────────────────────────────
export const sessions      = new Map();
export const sessionEvents = new EventEmitter();

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
  //  Socket — NO browser field.
  //  browser: ['...', 'Chrome', '...'] blocks pairing
  //  codes entirely. Mobile-type session is required.
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
  //  Pairing code request
  //  ✅ sock.authState.creds  →  live (not stale snapshot)
  //  ✅ 3000 ms delay         →  WA needs time to be ready
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
      // The WhatsApp number that just connected IS the
      // owner. Save it so isOwner checks work immediately
      // without any manual configuration in .env or config.
      try {
        const myJid    = sock.user?.id || '';
        // JID format: "2547XXXXXXXX:XX@s.whatsapp.net"
        const myNumber = myJid.split(':')[0].split('@')[0].replace(/[^0-9]/g, '');
        if (myNumber) {
          config.OWNER_NUMBER = myNumber;          // live in-memory
          await dbSet('bot:ownerNumber', myNumber); // survive restarts
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
  //  Messages — cache + route to handler
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  //  Anti-delete — delegate to handler's deletedMsgHandler
  //  (handler keeps its own msgCache; no duplicate cache here)
  // ────────────────────────────────────────────────
  sock.ev.on('messages.delete', (item) =>
    deletedMsgHandler(sock, item, userId).catch(() => {})
  );

  // ────────────────────────────────────────────────
  //  Anti-edit — delegate to handler's editedMsgHandler
  // ────────────────────────────────────────────────
  sock.ev.on('messages.update', (updates) =>
    editedMsgHandler(sock, updates, userId).catch(() => {})
  );

  // ────────────────────────────────────────────────
  //  Anti-call — reject incoming calls
  // ────────────────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    const settings = (await dbGet(`settings:${userId}`)) || {};
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
    const settings = (await dbGet(`settings:${userId}`)) || {};
    if (settings.alwaysonline) {
      await sock.sendPresenceUpdate('available').catch(() => {});
    }
  }, 30000);

  // Clean up interval when session is removed
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
  sessionEvents.emit('removed', { userId });
}

// ──────────────────────────────────────────────────
//  Restore all persisted sessions on startup
// ──────────────────────────────────────────────────
export async function restoreAllSessions() {
  await fs.ensureDir(config.SESSION_DIR);

  // ── Restore saved owner number FIRST, before any session loads ──
  // This ensures isOwner checks work correctly the moment commands
  // are processed, even before connection.update fires.
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

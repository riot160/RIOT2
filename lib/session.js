// ═══════════════════════════════════════════════════
//  RIOT MD  ·  lib/session.js  — PAIRING FIX v4
//
//  Fixes:
//  ✅ removeSession no longer calls sock.logout() on
//     unregistered sessions — prevents auth corruption
//  ✅ Pairing waits for WS 'open' event instead of
//     fixed 3s delay — works reliably on slow servers
//  ✅ sock.ws.close() used instead of sock.end()
//     (sock.end doesn't exist in Baileys v6.7+)
//  ✅ 8 second max wait added before requesting code
//     so Railway/Render cold-start never times out
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

// ─────────────────────────────────────────────────
//  Wait for WebSocket to be open (with timeout)
// ─────────────────────────────────────────────────
function waitForWsOpen(sock, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    // Already open
    if (sock.ws?.readyState === 1) return resolve();

    const timer = setTimeout(() => {
      reject(new Error('WebSocket did not open in time. Check your internet connection or try again.'));
    }, timeoutMs);

    // Baileys emits connection.update — when ws opens it fires with isOnline/connecting
    const handler = (update) => {
      // The socket is ready for pairing when it reaches 'connecting' or 'open'
      // We listen for the raw WS open
      if (sock.ws?.readyState === 1) {
        clearTimeout(timer);
        sock.ev.off('connection.update', handler);
        resolve();
      }
    };
    sock.ev.on('connection.update', handler);

    // Also poll every 200ms in case the event already fired
    const poll = setInterval(() => {
      if (sock.ws?.readyState === 1) {
        clearTimeout(timer);
        clearInterval(poll);
        sock.ev.off('connection.update', handler);
        resolve();
      }
    }, 200);

    timer._clearPoll = () => clearInterval(poll);
  });
}

export async function createSession(userId, phoneNumber = null, pairingMode = true) {
  // ── FIX 1: Remove old session safely ──
  // Do NOT call logout() if not registered — it corrupts auth state
  if (sessions.has(userId)) {
    const old = sessions.get(userId);
    if (old?.sock) {
      // Only logout if actually connected/registered
      if (old.status === 'connected') {
        try { await old.sock.logout(); } catch {}
      }
      // Close WebSocket properly
      try { old.sock.ws?.close(); } catch {}
      try { old.sock.ev?.removeAllListeners(); } catch {}
    }
    sessions.delete(userId);
    // Small gap to let cleanup complete
    await new Promise(r => setTimeout(r, 500));
  }

  const sessionPath = path.join(config.SESSION_DIR, userId);
  await fs.ensureDir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  const getMessage = async (key) => {
    const cached = msgCache.get(key.id);
    if (cached?.rawMessage) return cached.rawMessage;
    return { conversation: '' };
  };

  // ── FIX 2: No 'browser' field for pairing codes ──
  // Setting browser to a desktop agent breaks pairing in Baileys v6.7+
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
    // No 'browser' field — required for pairing codes to work
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

  // ── FIX 3: Event-based waiting instead of fixed delay ──
  // Wait for WS to actually open before requesting pairing code
  if (pairingMode && !sock.authState.creds.registered && phoneNumber) {
    (async () => {
      try {
        // Wait for WebSocket to be ready (up to 8 seconds)
        await waitForWsOpen(sock, 8000);

        // Small buffer after WS open — Baileys needs to finish handshake
        await new Promise(r => setTimeout(r, 1500));

        const rawNumber = phoneNumber.replace(/[^0-9]/g, '');
        const code      = await sock.requestPairingCode(rawNumber);
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
        const msg = e.message || 'Unknown pairing error';
        console.error(`  ❌  Pairing error [${userId}]:`, msg);
        sessionEvents.emit('error', { userId, error: msg });
        // Mark so the API timeout returns a useful error
        session.pairingError = msg;
      }
    })();
  }

  // ── Connection update ──────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      session.status      = 'connected';
      session.connectedAt = Date.now();
      session.pairingCode = null;
      await saveCreds();

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

  sock.ev.on('messages.delete', (item) =>
    deletedMsgHandler(sock, item, userId).catch(() => {})
  );

  sock.ev.on('messages.update', (updates) =>
    editedMsgHandler(sock, updates, userId).catch(() => {})
  );

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

// ── FIX 4: Safe removeSession ──────────────────────
export async function removeSession(userId) {
  const session = sessions.get(userId);
  if (session?.sock) {
    // Only logout if actually connected — never on unregistered sessions
    if (session.status === 'connected') {
      try { await session.sock.logout(); } catch {}
    }
    // Use ws.close() — sock.end() does not exist in Baileys v6.7+
    try { session.sock.ws?.close(); } catch {}
    try { session.sock.ev?.removeAllListeners(); } catch {}
  }
  sessions.delete(userId);
  sessionEvents.emit('removed', { userId });
}

export async function restoreAllSessions() {
  await fs.ensureDir(config.SESSION_DIR);

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

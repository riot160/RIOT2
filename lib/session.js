// ═══════════════════════════════════════════════════
//  RIOT MD  ·  SESSION MANAGER  — ALL BUGS FIXED
//
//  Fixes applied:
//  ✅ getMessage now returns actual cached messages
//     so Baileys can properly decrypt replies/forwards
//  ✅ messages.update routed to editedMsgHandler
//     which handles BOTH DM antidelete AND edits
//  ✅ messages.delete routed to deletedMsgHandler
//     for group "delete for everyone"
//  ✅ anticall uses custom message from settings
//  ✅ auto-owner: linked number saved and restored
//  ✅ alwaysonline presence heartbeat
//  ✅ welcome/goodbye on group changes
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
  msgCache,                // ← FIX 4: import shared cache for getMessage
} from './handler.js';
import { dbGet, dbSet, getGroup } from './database.js';

const logger = pino({ level: 'silent' });

export const sessions      = new Map();
export const sessionEvents = new EventEmitter();

// ─────────────────────────────────────────────────
//  Create / restore a session
// ─────────────────────────────────────────────────
export async function createSession(userId, phoneNumber = null, pairingMode = true) {
  if (sessions.has(userId)) await removeSession(userId);

  const sessionPath = path.join(config.SESSION_DIR, userId);
  await fs.ensureDir(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version }          = await fetchLatestBaileysVersion();

  // ── FIX 4: getMessage uses real cache ──────────
  // Baileys calls this when it needs the original message
  // for decryption of replies/forwards. Returning the real
  // message allows proper antidelete resend and media handling.
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
    getMessage,                     // ← uses real cache now
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

  // ── Route messages ───────────────────────────────
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

  // ── Anti-delete (GROUP): messages.delete event ──
  // Note: DM deletions come through messages.update (handled below)
  sock.ev.on('messages.delete', (item) =>
    deletedMsgHandler(sock, item, userId).catch(() => {})
  );

  // ── Anti-delete (DM) + Anti-edit: messages.update ──
  // FIX 3: editedMsgHandler now handles BOTH:
  //   - protocolMessage type REVOKE (0) = DM deletion
  //   - message edit events
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
        // Use custom message if set, else default
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

// ─────────────────────────────────────────────────
//  Remove a session
// ─────────────────────────────────────────────────
export async function removeSession(userId) {
  const session = sessions.get(userId);
  if (session?.sock) {
    try { await session.sock.logout(); } catch {}
    try { session.sock.end();          } catch {}
  }
  sessions.delete(userId);
  sessionEvents.emit('removed', { userId });
}

// ─────────────────────────────────────────────────
//  Restore all sessions on startup
// ─────────────────────────────────────────────────
export async function restoreAllSessions() {
  await fs.ensureDir(config.SESSION_DIR);

  // Restore saved owner BEFORE sessions load so isOwner works immediately
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

// ─────────────────────────────────────────────────
//  Stats helper
// ─────────────────────────────────────────────────
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

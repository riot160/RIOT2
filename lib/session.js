// ═══════════════════════════════════════════════════
//  RIOT MD - SESSION MANAGER (FIXED PAIRING)
// ═══════════════════════════════════════════════════

import { makeWASocket, useMultiFileAuthState, DisconnectReason,
fetchLatestBaileysVersion, makeCacheableSignalKeyStore }
from '@whiskeysockets/baileys'

import { Boom } from '@hapi/boom'
import pino from 'pino'
import fs from 'fs-extra'
import path from 'path'
import { EventEmitter } from 'events'
import { config } from '../config.js'
import { messageHandler } from './handler.js'

const logger = pino({ level: "silent" })

export const sessions = new Map()
export const sessionEvents = new EventEmitter()

// ─────────────────────────────────────
// CREATE SESSION
// ─────────────────────────────────────
export async function createSession(userId, phoneNumber = null, pairingMode = true) {

if (sessions.has(userId)) await removeSession(userId)

const sessionPath = path.join(config.SESSION_DIR, userId)
await fs.ensureDir(sessionPath)

const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
version,
logger,
printQRInTerminal: false,
auth: {
creds: state.creds,
keys: makeCacheableSignalKeyStore(state.keys, logger)
},
browser: ['RIOT MD', 'Chrome', '120'],
markOnlineOnConnect: true,
generateHighQualityLinkPreview: true,
getMessage: async () => ({ conversation: "RIOT MD" })
})

const session = {
sock,
userId,
phoneNumber,
status: "connecting",
pairingCode: null,
connectedAt: null,
messageCount: 0,
commandCount: 0
}

sessions.set(userId, session)


// ─────────────────────────────────────
// CONNECTION UPDATE
// ─────────────────────────────────────

sock.ev.on("connection.update", async (update) => {

const { connection, lastDisconnect } = update

// CONNECTED
if (connection === "open") {

session.status = "connected"
session.connectedAt = Date.now()
session.pairingCode = null

await saveCreds()

sessionEvents.emit("connected", { userId, phoneNumber })

console.log(`✅ Session ${userId} connected`)

}


// ─────────────────────────────────────
// PAIRING CODE FIX
// ─────────────────────────────────────

if (!sock.authState.creds.registered && pairingMode && phoneNumber) {

try {

const cleanNumber = phoneNumber.replace(/\D/g, "")

const code = await sock.requestPairingCode(cleanNumber)

const formatted = code.match(/.{1,4}/g)?.join("-") || code

session.pairingCode = formatted

sessionEvents.emit("pairingCode", {
userId,
code: formatted,
phoneNumber
})

console.log(`
╔══════════════════════════╗
║       RIOT MD PAIR       ║
╠══════════════════════════╣
║ Number : ${cleanNumber}
║ Code   : ${formatted}
╚══════════════════════════╝
`)

} catch (err) {

console.log("Pairing error:", err)

}

}


// DISCONNECTED
if (connection === "close") {

const code = (lastDisconnect?.error instanceof Boom)
? lastDisconnect.error.output?.statusCode
: 500

const loggedOut = code === DisconnectReason.loggedOut

session.status = loggedOut ? "logged_out" : "reconnecting"

sessionEvents.emit("disconnected", { userId, code, loggedOut })

if (loggedOut) {

console.log(`⚠️ Session ${userId} logged out`)
await removeSession(userId)

} else {

console.log(`🔄 Reconnecting session ${userId}`)
setTimeout(() => createSession(userId, phoneNumber, false), 5000)

}

}

})

sock.ev.on("creds.update", saveCreds)


// ─────────────────────────────────────
// MESSAGE HANDLER
// ─────────────────────────────────────

sock.ev.on("messages.upsert", async (m) => {

if (m.type !== "notify") return

session.messageCount++

for (const msg of m.messages) {

try {

await messageHandler(sock, msg, userId)

} catch (e) {

console.log("Handler error:", e.message)

}

}

})

return session

}


// ─────────────────────────────────────
// REMOVE SESSION
// ─────────────────────────────────────

export async function removeSession(userId) {

const session = sessions.get(userId)

if (session?.sock) {

try { await session.sock.logout() } catch {}

try { session.sock.end() } catch {}

}

sessions.delete(userId)

sessionEvents.emit("removed", { userId })

}


// ─────────────────────────────────────
// RESTORE SESSIONS
// ─────────────────────────────────────

export async function restoreAllSessions() {

await fs.ensureDir(config.SESSION_DIR)

const dirs = await fs.readdir(config.SESSION_DIR)

let restored = 0

for (const userId of dirs) {

const creds = path.join(config.SESSION_DIR, userId, "creds.json")

if (await fs.pathExists(creds)) {

await createSession(userId, null, false)

restored++

}

}

return restored

}


// ─────────────────────────────────────
// SESSION STATS
// ─────────────────────────────────────

export function getSessionStats() {

const all = [...sessions.values()]

return {

total: all.length,

connected: all.filter(s => s.status === "connected").length,

connecting: all.filter(s => s.status === "connecting").length,

reconnecting: all.filter(s => s.status === "reconnecting").length,

messages: all.reduce((a, s) => a + s.messageCount, 0),

commands: all.reduce((a, s) => a + s.commandCount, 0)

}

}

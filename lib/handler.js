// ═════════════════════════════════════════════════════════════
//  RIOT MD  ·  MESSAGE HANDLER  (FULLY FIXED)
//  Developer : Sydney Sider
// ═════════════════════════════════════════════════════════════

import { jidDecode, downloadContentFromMessage } from "@whiskeysockets/baileys"
import { config } from "../config.js"
import { commands, checkCooldown } from "./commands.js"
import { sessions } from "./session.js"
import { dbGet } from "./database.js"
import fetch from "node-fetch"

// ── MESSAGE CACHE (anti delete / edit)
export const msgCache = new Map()

// ── TEXT EXTRACTOR
function extractText(msg) {
const m = msg.message
if (!m) return ""

return (
m.conversation ||
m.extendedTextMessage?.text ||
m.imageMessage?.caption ||
m.videoMessage?.caption ||
m.buttonsResponseMessage?.selectedDisplayText ||
m.listResponseMessage?.title ||
""
)
}

// ── NORMALIZE NUMBER
function normalizeNumber(num) {

const cleaned = String(num).replace(/\D/g,"")

if (cleaned.startsWith("254")) return cleaned
if (cleaned.startsWith("0")) return "254" + cleaned.slice(1)

return cleaned

}

// ── CONTEXT BUILDER
function buildContext(sock,msg,userId){

const jid = msg.key.remoteJid || ""
const isGroup = jid.endsWith("@g.us")
const fromMe = msg.key.fromMe

const sender = isGroup
? msg.key.participant || jid
: fromMe
? sock.user?.id || jid
: jid

const senderNumber =
jidDecode(sender)?.user ||
sender.split(":")[0].split("@")[0]

const ownerNum = normalizeNumber(config.OWNER_NUMBER)

const isOwner =
normalizeNumber(senderNumber) === ownerNum

const body = extractText(msg)

const prefix = config.PREFIX

const isCmd = body.startsWith(prefix)

const [rawCmd = "",...argArr] = isCmd
? body.slice(prefix.length).trim().split(/\s+/)
: [""]

const command = rawCmd.toLowerCase()

const args = argArr

const text = args.join(" ")

const reply = (content)=>

typeof content === "string"
? sock.sendMessage(jid,{text:content},{quoted:msg})
: sock.sendMessage(jid,content,{quoted:msg})

const react = (emoji)=>
sock.sendMessage(jid,{react:{text:emoji,key:msg.key}})

return {

sock,
msg,
userId,
jid,
sender,
senderNumber,
isGroup,
fromMe,
isOwner,
body,
prefix,
isCmd,
command,
args,
text,
reply,
react,
pushName: msg.pushName || senderNumber

}

}

// ─────────────────────────────────────────────
// MESSAGE HANDLER
// ─────────────────────────────────────────────

export async function messageHandler(sock,msg,userId){

if(!msg.message) return

const type = Object.keys(msg.message)[0]

const SKIP = [
"protocolMessage",
"senderKeyDistributionMessage",
"pollUpdateMessage",
"reactionMessage"
]

if(SKIP.includes(type)) return

if(msg.key.remoteJid === "status@broadcast") return

const ctx = buildContext(sock,msg,userId)

// USER SETTINGS
const settings =
(await dbGet(`settings:${ctx.senderNumber}`)) || {}

// CACHE MESSAGE
if(!msg.key.fromMe){

msgCache.set(msg.key.id,{
text: ctx.body,
jid: ctx.jid,
sender: ctx.sender,
name: ctx.pushName,
time: Date.now()
})

if(msgCache.size > 300){

const first = msgCache.keys().next().value
msgCache.delete(first)

}

}

// IGNORE LIST
const ignoreList = settings.ignoreList || []

if(!ctx.isOwner && ignoreList.includes(ctx.senderNumber)) return

// AUTO READ
if(settings.autoread !== false && config.AUTO_READ){

await sock.readMessages([msg.key]).catch(()=>{})

}

// AUTO REACT
if(settings.autoreact && !msg.key.fromMe){

const emojis = ["🔥","❤️","⚡","💯","😂","👍"]

const emoji =
emojis[Math.floor(Math.random()*emojis.length)]

await ctx.react(emoji).catch(()=>{})

}

// CHATBOT
if(settings.chatbot && !ctx.isCmd && !msg.key.fromMe && ctx.body){

try{

const res = await fetch(
`https://text.pollinations.ai/${encodeURIComponent(ctx.body)}`
)

const text = await res.text()

if(text?.trim()) await ctx.reply("🤖 "+text)

}catch{}

return

}

// NOT COMMAND
if(!ctx.isCmd) return

// PRIVATE MODE
if(config.MODE === "private" && !ctx.isOwner) return

// AUTO TYPING
if(settings.autotyping !== false && config.AUTO_TYPING){

await sock.sendPresenceUpdate("composing",ctx.jid)
.catch(()=>{})

}

// LOAD COMMAND
const plugin = commands.get(ctx.command)

if(!plugin) return

// SUDO SYSTEM
const sudoList =
(settings.sudoList || []).map(normalizeNumber)

const isSudo =
sudoList.includes(normalizeNumber(ctx.senderNumber))

const hasOwnerAccess =
ctx.isOwner || isSudo

// PERMISSIONS
if(plugin.owner && !hasOwnerAccess){

return ctx.reply("❌ Owner only command")

}

if(plugin.group && !ctx.isGroup){

return ctx.reply("❌ Group only command")

}

// COOLDOWN
if(!hasOwnerAccess){

const wait =
checkCooldown(ctx.senderNumber,ctx.command)

if(wait > 0){

return ctx.reply(`⏳ Wait ${wait}s before using again`)

}

}

// SESSION TRACKING
const session = sessions.get(userId)

if(session) session.commandCount++

// RUN COMMAND
try{

await ctx.react("⚙️")

await plugin.run(ctx)

}catch(err){

console.error(`Command error [.${ctx.command}]`,err)

await ctx.reply("❌ Error: "+err.message)

}

}

// ─────────────────────────────────────────────
// STATUS HANDLER
// ─────────────────────────────────────────────

export async function statusHandler(sock,msg,userId){

const sender = msg.key.participant || ""
const senderNumber = sender.split("@")[0]

const settings =
(await dbGet(`settings:${senderNumber}`)) || {}

const jid = msg.key.remoteJid

// AUTO VIEW STATUS
if(settings.autoviewstatus){

await sock.readMessages([msg.key]).catch(()=>{})

}

// AUTO REACT STATUS
if(settings.autoreactstatus){

const emoji = settings.statusEmoji || "🔥"

await sock.sendMessage(
jid,
{react:{text:emoji,key:msg.key}},
{statusJidList:[sender]}
).catch(()=>{})

}

}

// ─────────────────────────────────────────────
// DELETE HANDLER
// ─────────────────────────────────────────────

export async function deletedMsgHandler(sock,item,userId){

const keys = item.keys || []

for(const key of keys){

const cached = msgCache.get(key.id)

if(!cached) continue

const settings =
(await dbGet(`settings:${cached.sender.split("@")[0]}`)) || {}

const mode = settings.antidelete

if(!mode) continue

const isGroup = cached.jid.endsWith("@g.us")

if(mode === "dm" && isGroup) continue
if(mode === "gc" && !isGroup) continue

await sock.sendMessage(cached.jid,{

text:
`🛡️ Anti Delete

👤 ${cached.name}
${cached.text || "[media message]"}`

}).catch(()=>{})

}

}

// ─────────────────────────────────────────────
// EDIT HANDLER
// ─────────────────────────────────────────────

export async function editedMsgHandler(sock,updates,userId){

for(const update of updates){

const cached = msgCache.get(update.key.id)

if(!cached) continue

const settings =
(await dbGet(`settings:${cached.sender.split("@")[0]}`)) || {}

if(!settings.antiedit) continue

await sock.sendMessage(cached.jid,{

text:
`✏️ Anti Edit

👤 ${cached.name}

Original:
${cached.text}`

}).catch(()=>{})

}

}

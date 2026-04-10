🟢 RIOT MD — Cyberpunk WhatsApp Bot System

<p align="center"><img src="https://readme-typing-svg.herokuapp.com?color=00FF9C&size=38&center=true&vCenter=true&width=1000&lines=RIOT+MD+WhatsApp+Automation+Platform;Cyberpunk+Multi+User+Bot;Advanced+Plugin+System;Powered+by+Node.js+%2B+Baileys;Developer:+Sydney+Sider"></p>---

<p align="center"><img src="https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif" width="850"></p>---

<p align="center">"Visitors" (https://komarev.com/ghpvc/?username=riot160&label=VISITORS&color=00ff9c&style=for-the-badge)

"Node" (https://img.shields.io/badge/Node.js-v20+-00ff9c?style=for-the-badge)
"Bot" (https://img.shields.io/badge/Bot-RIOT%20MD-black?style=for-the-badge)
"Platform" (https://img.shields.io/badge/Platform-WhatsApp-green?style=for-the-badge)
"License" (https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

</p>---

💻 RIOT MD Terminal

root@riot-md:~$ boot system

██████╗ ██╗ ██████╗ ████████╗
██╔══██╗██║██╔═══██╗╚══██╔══╝
██████╔╝██║██║   ██║   ██║
██╔══██╗██║██║   ██║   ██║
██║  ██║██║╚██████╔╝   ██║
╚═╝  ╚═╝╚═╝ ╚═════╝    ╚═╝

Initializing modules...
Loading plugins...
Starting API server...
Connecting WhatsApp sockets...

STATUS: ONLINE

---

🧠 About RIOT MD

RIOT MD is a powerful multi-session WhatsApp automation bot designed for developers who want advanced automation and plugin extensibility.

Built with:

- Node.js
- Baileys WhatsApp API
- Express REST API
- MongoDB / JSON DB
- Cyberpunk dashboard

---

👨‍💻 Developer

Sydney Sider

Cyber Security Enthusiast
Automation Developer
Bot Engineer

---

🔥 Features

Feature| Status
Multi User Sessions| ✅
Pairing Code Login| ✅
Plugin Command System| ✅
Cyberpunk Dashboard| ✅
REST API| ✅
JWT Security| ✅
Docker Support| ✅
Railway Deploy| ✅
Render Deploy| ✅
Live Logs| ✅

---

🚀 Deploy RIOT MD

Railway

""Deploy on Railway" (https://railway.app/button.svg)" (https://railway.app)

---

Render

""Deploy to Render" (https://render.com/images/deploy-to-render-button.svg)" (https://render.com)

---

Docker

docker-compose up -d

---

⚙ Installation

Clone Repository

git clone https://github.com/your-username/riot-md.git
cd riot-md

---

Install Dependencies

npm install

---

Configure Environment

cp .env.example .env

Edit ".env"

BOT_NAME=RIOT MD
OWNER_NUMBER=254700000000
PREFIX=.
MODE=public
DASHBOARD_PASS=riotmd2024
API_SECRET=supersecret
PORT=3000

---

Start Bot

node index.js

---

📱 Pair WhatsApp

Open dashboard

http://localhost:3000

Steps

1 Login dashboard
2 Open Pair Device
3 Enter phone number
4 Generate pairing code
5 Link device on WhatsApp

---

🧩 Plugin System

Plugins automatically load from:

plugins/<category>/

Example plugin

export const hello = {

command: ["hello","hi"],
desc: "Say hello",

run: async ({ reply }) => {

reply("Hello hacker 🚀")

}

}

---

🧠 Command Categories

Owner

.menu
.ping
.reload
.broadcast
.block
.unblock
.shutdown

---

Group

.kick
.promote
.demote
.tagall
.open
.close
.warn

---

AI

.ai
.ask
.chatgpt
.weather
.translate
.image

---

Fun

.joke
.truth
.dare
.roll
.flip
.meme

---

Tools

.calc
.qr
.shortlink
.crypto
.ip
.encode
.decode
.github

---

Downloads

.play
.ytmp3
.ytmp4
.tiktok
.instagram
.spotify

---

🌐 Dashboard Pages

Page| Route
Overview| "/"
Pair Device| "/#pair"
Sessions| "/#sessions"
Plugins| "/#plugins"
Logs| "/#logs"

---

📂 Project Structure

RIOT-MD
│
├ index.js
├ server.js
├ config.js
├ package.json
│
├ lib
│ ├ session.js
│ ├ handler.js
│ ├ commands.js
│ └ database.js
│
├ plugins
│ ├ owner
│ ├ group
│ ├ ai
│ ├ fun
│ ├ tools
│ └ download
│
├ dashboard
│ └ public
│    └ index.html
│
├ sessions
└ database

---

📊 GitHub Stats

<p align="center"><img src="https://github-readme-stats.vercel.app/api?username=riot160&show_icons=true&theme=radical"><img src="https://github-readme-streak-stats.herokuapp.com/?user=riot160&theme=radical"></p>---

🛡 Security

Before deploying change

DASHBOARD_PASS
API_SECRET
OWNER_NUMBER

Never expose

.env
sessions/
database/

---

⚡ System Status

SYSTEM STATUS : ONLINE
MULTI SESSION : ACTIVE
API SECURITY  : ENABLED
DASHBOARD     : RUNNING
NODE ENGINE   : ACTIVE

---

📜 License

MIT License

---

⚡ RIOT MD

Cyberpunk WhatsApp Automation Platform

// plugins/settings/getsettings.js
import { dbGet } from '../../lib/database.js';
import { config } from '../../config.js';

export default {
  command: ['getsettings', 'settings', 'mysettings'],
  desc: 'View all current bot settings',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const icon = (v, def = false) => (v === undefined ? def : v) ? '✅ ON' : '❌ OFF';
    await reply(
      `┏▣ ◈ *RIOT MD SETTINGS* ◈\n` +
      `┃\n` +
      `┃ ── General ──\n` +
      `┃ ⌨️  autoread        : ${icon(s.autoread, true)}\n` +
      `┃ ⌨️  autotype        : ${icon(s.autotyping, true)}\n` +
      `┃ 🎙️  autorecord      : ${icon(s.autorecord)}\n` +
      `┃ 🟢 alwaysonline    : ${icon(s.alwaysonline)}\n` +
      `┃ 🌐 mode            : ${(s.mode || config.MODE).toUpperCase()}\n` +
      `┃ 🔑 prefix          : ${s.prefix || config.PREFIX}\n` +
      `┃\n` +
      `┃ ── Status ──\n` +
      `┃ 👀 autoviewstatus  : ${icon(s.autoviewstatus)}\n` +
      `┃ 🔥 autoreactstatus : ${icon(s.autoreactstatus)}\n` +
      `┃ 💾 autosavestatus  : ${icon(s.autosavestatus)}\n` +
      `┃ 😀 statusEmoji     : ${s.statusEmoji || '🔥'}\n` +
      `┃ ⏱️  statusDelay     : ${(s.statusDelay || 0) / 1000}s\n` +
      `┃\n` +
      `┃ ── Protection ──\n` +
      `┃ 📵 anticall        : ${icon(s.anticall)}\n` +
      `┃ 🛡️  antidelete      : ${icon(s.antidelete)}\n` +
      `┃ 🛡️  antideletestatus: ${icon(s.antideletestatus)}\n` +
      `┃ ✏️  antiedit        : ${icon(s.antiedit)}\n` +
      `┃ 🔓 antiviewonce    : ${icon(s.antiviewonce)}\n` +
      `┃ 🐛 antibug         : ${icon(s.antibug)}\n` +
      `┃ 🚫 autoblock       : ${icon(s.autoblock)}\n` +
      `┃\n` +
      `┃ ── AI / Extra ──\n` +
      `┃ 🤖 chatbot         : ${icon(s.chatbot)}\n` +
      `┃ 💬 autoreact       : ${icon(s.autoreact)}\n` +
      `┃ ✍️  autobio         : ${icon(s.autobio)}\n` +
      `┗▣\n\n` +
      `_Type .resetsetting to reset all to default_`
    );
  },
};

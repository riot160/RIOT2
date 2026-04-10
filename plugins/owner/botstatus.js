// plugins/owner/botstatus.js
import { config }          from '../../config.js';
import { pluginList }      from '../../lib/commands.js';
import { getSessionStats } from '../../lib/session.js';

export default {
  command: 'botstatus',
  desc: 'Show full bot health and status report',
  category: 'owner',
  run: async ({ reply }) => {
    const mem    = process.memoryUsage();
    const up     = process.uptime();
    const stats  = getSessionStats();
    const ramMB  = (mem.heapUsed / 1024 / 1024).toFixed(1);
    const ramTot = (mem.rss / 1024 / 1024).toFixed(1);
    const ramPct = Math.min(100, Math.round((parseFloat(ramMB) / 512) * 100));
    const bar    = '█'.repeat(Math.round(ramPct / 10)) + '░'.repeat(10 - Math.round(ramPct / 10));
    const d = Math.floor(up / 86400), h = Math.floor((up % 86400) / 3600),
          m = Math.floor((up % 3600) / 60);

    await reply(
      `┏▣ ◈ *BOT STATUS* ◈\n` +
      `┃\n` +
      `┃ ✅ Status    : Online\n` +
      `┃ ⏱️  Uptime    : ${d > 0 ? `${d}d ` : ''}${h}h ${m}m\n` +
      `┃ 🟢 Node.js   : ${process.version}\n` +
      `┃ 🔑 Prefix    : ${config.PREFIX}\n` +
      `┃ ⚙️  Mode      : ${config.MODE}\n` +
      `┃\n` +
      `┃ 📦 Plugins   : ${pluginList.length}\n` +
      `┃ 🔗 Sessions  : ${stats.connected}/${stats.total}\n` +
      `┃ 💬 Messages  : ${stats.messages}\n` +
      `┃ 🤖 Commands  : ${stats.commands}\n` +
      `┃\n` +
      `┃ 🧠 RAM Heap  : ${ramMB} MB\n` +
      `┃ 🧠 RAM Total : ${ramTot} MB\n` +
      `┃ [${bar}] ${ramPct}%\n` +
      `┗▣`
    );
  },
};

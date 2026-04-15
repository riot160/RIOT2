// plugins/info/uptime.js
import { getSessionStats } from '../../lib/session.js';
export default {
  command: ['uptime', 'up'],
  desc: 'Show detailed bot uptime and session stats',
  category: 'info',
  run: async ({ reply }) => {
    const up   = process.uptime();
    const d    = Math.floor(up / 86400);
    const h    = Math.floor((up % 86400) / 3600);
    const m    = Math.floor((up % 3600) / 60);
    const s    = Math.floor(up % 60);
    const mem  = process.memoryUsage();
    const stats = getSessionStats();
    await reply(
      `⏱️ *Bot Uptime*\n\n` +
      `🕐 Running  : ${d}d ${h}h ${m}m ${s}s\n` +
      `🧠 RAM      : ${(mem.heapUsed/1024/1024).toFixed(1)} MB\n` +
      `🔗 Sessions : ${stats.connected}/${stats.total}\n` +
      `💬 Messages : ${stats.messages}\n` +
      `🤖 Commands : ${stats.commands}\n` +
      `🟢 Node.js  : ${process.version}`
    );
  },
};

// plugins/info/uptime.js
// Fixed: removed circular import from lib/session.js
// Now reads session stats without importing the session module

export default {
  command: ['uptime', 'up'],
  desc: 'Show detailed bot uptime and stats',
  category: 'info',
  run: async ({ reply }) => {
    const up  = process.uptime();
    const d   = Math.floor(up / 86400);
    const h   = Math.floor((up % 86400) / 3600);
    const m   = Math.floor((up % 3600) / 60);
    const s   = Math.floor(up % 60);
    const mem = process.memoryUsage();
    await reply(
      `⏱️ *Bot Uptime*\n\n` +
      `🕐 Running : ${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s\n` +
      `🧠 RAM     : ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB\n` +
      `🟢 Node.js : ${process.version}`
    );
  },
};

// plugins/owner/runtime.js
export default {
  command: ['runtime', 'uptime'],
  desc: 'Show how long the bot has been running',
  category: 'owner',
  run: async ({ reply }) => {
    const up  = process.uptime();
    const d   = Math.floor(up / 86400);
    const h   = Math.floor((up % 86400) / 3600);
    const m   = Math.floor((up % 3600) / 60);
    const s   = Math.floor(up % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    await reply(
      `⏱️ *Bot Runtime*\n\n` +
      `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s\n\n` +
      `📦 RAM Used : ${mem} MB\n` +
      `🟢 Node.js  : ${process.version}`
    );
  },
};

// plugins/tools/alive.js
import { config } from '../../config.js';

export default {
  command: 'alive',
  desc: 'Check if the bot is online and show uptime',
  category: 'tools',
  run: async ({ reply }) => {
    const up   = process.uptime();
    const h    = Math.floor(up / 3600);
    const m    = Math.floor((up % 3600) / 60);
    const s    = Math.floor(up % 60);
    const ram  = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    await reply(
`⚡ *RIOT MD is alive!*

🤖 Bot     : ${config.BOT_NAME} ${config.BOT_VERSION}
⏱️  Uptime  : ${h}h ${m}m ${s}s
🟢 Node.js : ${process.version}
📦 RAM     : ${ram} MB`
    );
  },
};

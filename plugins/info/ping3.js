// plugins/info/ping3.js
export default {
  command: ['ping3', 'pong'],
  desc: 'Ultra-detailed bot ping with system info',
  category: 'info',
  run: async ({ sock, jid, msg, reply }) => {
    const start = Date.now();
    await sock.sendMessage(jid, { react: { text: '⚡', key: msg.key } });
    const latency = Date.now() - start;
    const mem     = process.memoryUsage();
    const ramUsed = (mem.heapUsed  / 1024 / 1024).toFixed(1);
    const ramFree = (mem.rss       / 1024 / 1024).toFixed(1);
    const status  = latency < 100 ? '🟢 Excellent' : latency < 300 ? '🟡 Good' : '🔴 Slow';
    await reply(
      `🏓 *PONG!*\n\n` +
      `⚡ Latency  : *${latency}ms*\n` +
      `📊 Status   : ${status}\n` +
      `🧠 Heap RAM : ${ramUsed} MB\n` +
      `💻 RSS RAM  : ${ramFree} MB\n` +
      `🟢 Node.js  : ${process.version}\n` +
      `⏱️  Uptime   : ${Math.floor(process.uptime()/60)}m`
    );
  },
};

// plugins/tools/speedtest2.js
import fetch from 'node-fetch';
export default {
  command: ['speedtest2', 'ping2', 'latency'],
  desc: 'Test bot server latency to major services',
  category: 'tools',
  run: async ({ reply }) => {
    const targets = [
      { name: 'Google',     url: 'https://www.google.com' },
      { name: 'Cloudflare', url: 'https://1.1.1.1' },
      { name: 'GitHub',     url: 'https://github.com' },
      { name: 'WhatsApp',   url: 'https://web.whatsapp.com' },
    ];
    await reply('⚡ Running latency test…');
    let results = `📡 *Server Latency Test*\n${'─'.repeat(28)}\n\n`;
    for (const t of targets) {
      const start = Date.now();
      try {
        await fetch(t.url, { signal: AbortSignal.timeout(5000) });
        const ms = Date.now() - start;
        const bar = ms < 100 ? '🟢' : ms < 300 ? '🟡' : '🔴';
        results += `${bar} ${t.name.padEnd(12)} : ${ms}ms\n`;
      } catch {
        results += `🔴 ${t.name.padEnd(12)} : timeout\n`;
      }
    }
    results += `\n_🟢 <100ms  🟡 <300ms  🔴 >300ms_`;
    await reply(results);
  },
};

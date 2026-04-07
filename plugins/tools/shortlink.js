// plugins/tools/shortlink.js
import fetch from 'node-fetch';

export default {
  command: ['shortlink', 'shorten', 'tiny'],
  desc: 'Shorten a URL — .shortlink <url>',
  category: 'tools',
  run: async ({ args, reply }) => {
    const url = args[0];
    if (!url) return reply('Usage: .shortlink <url>\nExample: .shortlink https://google.com');
    if (!url.startsWith('http')) return reply('❌ URL must start with http:// or https://');
    try {
      const res   = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const short = await res.text();
      await reply(`🔗 *URL Shortener*\n\n📥 Original : ${url}\n📤 Short    : ${short}`);
    } catch {
      await reply('❌ Could not shorten URL. Try again.');
    }
  },
};

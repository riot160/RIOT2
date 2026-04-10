// plugins/tools/tinyurl.js
import fetch from 'node-fetch';

export default {
  command: ['tinyurl', 'shorten', 'short'],
  desc: 'Shorten any URL — .tinyurl https://example.com',
  category: 'tools',
  run: async ({ args, reply }) => {
    const url = args[0];
    if (!url || !url.startsWith('http'))
      return reply('Usage: .tinyurl <url>\nExample: .tinyurl https://google.com');
    try {
      const res   = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      const short = await res.text();
      if (!short.startsWith('http')) throw new Error('Invalid response');
      await reply(
        `🔗 *URL Shortener*\n\n` +
        `📥 Original : ${url.slice(0, 60)}${url.length > 60 ? '…' : ''}\n` +
        `📤 Short    : ${short}`
      );
    } catch {
      await reply('❌ Could not shorten URL. Try again.');
    }
  },
};

// plugins/tools/news.js
import fetch from 'node-fetch';

export default {
  command: ['news', 'headlines'],
  desc: 'Get latest news — .news  or  .news technology',
  category: 'tools',
  run: async ({ args, reply }) => {
    const topic = args.join(' ') || 'world';
    await reply(`📰 Fetching news: *${topic}*…`);
    try {
      // Using RSS-to-JSON from Google News (no API key needed)
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          `https://news.google.com/rss/search?q=${topic}&hl=en`
        )}&count=5`
      );
      const d = await res.json();
      if (!d.items?.length) return reply(`❌ No news found for: *${topic}*`);
      let text = `📰 *Top News: ${topic}*\n${'─'.repeat(26)}\n\n`;
      d.items.slice(0, 5).forEach((item, i) => {
        const date = new Date(item.pubDate).toLocaleDateString();
        text += `*${i + 1}. ${item.title}*\n📅 ${date}\n🔗 ${item.link}\n\n`;
      });
      await reply(text.trim());
    } catch {
      await reply('❌ News service unavailable. Try again later.');
    }
  },
};

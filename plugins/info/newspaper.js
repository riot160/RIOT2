// plugins/info/newspaper.js
import fetch from 'node-fetch';
const FEEDS = {
  bbc:     'http://feeds.bbci.co.uk/news/rss.xml',
  cnn:     'http://rss.cnn.com/rss/edition.rss',
  aljazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
  techcrunch: 'https://techcrunch.com/feed/',
  africa:  'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf',
};
export default {
  command: ['newspaper', 'headlines2', 'topnews'],
  desc: 'Get headlines from different news sources — .newspaper bbc',
  category: 'info',
  run: async ({ args, reply }) => {
    const source = (args[0] || 'bbc').toLowerCase();
    const url    = FEEDS[source];
    if (!url) return reply(`Available sources: ${Object.keys(FEEDS).join(', ')}\nExample: .newspaper bbc`);
    await reply(`📰 Fetching *${source.toUpperCase()}* headlines…`);
    try {
      const res  = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
      const xml  = await res.text();
      const items = [...xml.matchAll(/<item>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>[\s\S]*?<\/item>/g)]
        .slice(0, 7)
        .map(m => m[1].trim());
      if (!items.length) throw new Error('No items');
      let text = `📰 *${source.toUpperCase()} Headlines*\n${'─'.repeat(28)}\n\n`;
      items.forEach((h, i) => { text += `${i + 1}. ${h}\n\n`; });
      await reply(text.trim());
    } catch { await reply(`❌ Could not fetch ${source} headlines. Try: ${Object.keys(FEEDS).join(', ')}`); }
  },
};

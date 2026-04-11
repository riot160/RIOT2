// plugins/tools/bible.js
import fetch from 'node-fetch';

export default {
  command: ['bible', 'verse'],
  desc: 'Get a Bible verse — .bible John 3:16  or  .bible random',
  category: 'tools',

  run: async ({ text, reply }) => {
    const query = text?.trim() || 'random';
    try {
      let url;
      if (query === 'random') {
        url = 'https://bible-api.com/?random=verse';
      } else {
        url = `https://bible-api.com/${encodeURIComponent(query)}`;
      }

      const res  = await fetch(url);
      const d    = await res.json();

      if (d.error) return reply(`❌ Verse not found: *${query}*\n\nExamples:\n• .bible John 3:16\n• .bible Psalms 23:1\n• .bible random`);

      const reference = d.reference || query;
      const verseText = d.text?.trim() || '—';

      await reply(
        `📖 *${reference}*\n\n` +
        `_"${verseText}"_\n\n` +
        `— 🕊️ Holy Bible (KJV)`
      );
    } catch (e) {
      await reply('❌ Bible verse lookup failed: ' + e.message);
    }
  },
};

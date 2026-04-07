// plugins/tools/wotd.js  — Word of the Day
import fetch from 'node-fetch';

export default {
  command: ['wotd', 'wordofday'],
  desc: 'Get the Word of the Day',
  category: 'tools',
  run: async ({ reply }) => {
    try {
      // Random word from a curated list via datamuse
      const res  = await fetch('https://api.datamuse.com/words?ml=interesting&max=100');
      const list = await res.json();
      const word = list[Math.floor(Math.random() * list.length)]?.word;
      if (!word) throw new Error('No word');

      // Get definition
      const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const defData = await defRes.json();
      const entry   = Array.isArray(defData) ? defData[0] : null;
      const def     = entry?.meanings?.[0]?.definitions?.[0]?.definition || 'Definition not found';
      const pos     = entry?.meanings?.[0]?.partOfSpeech || '';

      await reply(
`📚 *Word of the Day*

✏️  Word : *${word}*
🏷️  Type : ${pos}
📖 Meaning : ${def}`
      );
    } catch {
      await reply('❌ Could not fetch word of the day. Try again.');
    }
  },
};

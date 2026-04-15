// plugins/tools/rhyme.js
import fetch from 'node-fetch';
export default {
  command: ['rhyme', 'rhymes'],
  desc: 'Find words that rhyme — .rhyme cat',
  category: 'tools',
  run: async ({ args, reply }) => {
    const word = args[0];
    if (!word) return reply('Usage: .rhyme <word>\nExample: .rhyme cat');
    try {
      const res = await fetch(`https://api.datamuse.com/words?rel_rhy=${word}&max=15`);
      const d   = await res.json();
      if (!d.length) return reply(`❌ No rhymes found for *${word}*`);
      await reply(`🎵 *Words that rhyme with "${word}"*\n\n${d.map(w => w.word).join(' · ')}`);
    } catch { await reply('❌ Rhyme lookup failed.'); }
  },
};

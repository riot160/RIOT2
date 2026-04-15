// plugins/tools/synonym.js
import fetch from 'node-fetch';
export default {
  command: ['synonym', 'syn'],
  desc: 'Get synonyms of a word — .synonym happy',
  category: 'tools',
  run: async ({ args, reply }) => {
    const word = args[0];
    if (!word) return reply('Usage: .synonym <word>\nExample: .synonym happy');
    try {
      const res = await fetch(`https://api.datamuse.com/words?rel_syn=${word}&max=12`);
      const d   = await res.json();
      if (!d.length) return reply(`❌ No synonyms found for *${word}*`);
      await reply(`📖 *Synonyms of "${word}"*\n\n${d.map(w => w.word).join(' · ')}`);
    } catch { await reply('❌ Synonym lookup failed.'); }
  },
};

// plugins/tools/antonym.js
import fetch from 'node-fetch';
export default {
  command: ['antonym', 'ant'],
  desc: 'Get antonyms of a word — .antonym happy',
  category: 'tools',
  run: async ({ args, reply }) => {
    const word = args[0];
    if (!word) return reply('Usage: .antonym <word>\nExample: .antonym happy');
    try {
      const res = await fetch(`https://api.datamuse.com/words?rel_ant=${word}&max=12`);
      const d   = await res.json();
      if (!d.length) return reply(`❌ No antonyms found for *${word}*`);
      await reply(`📖 *Antonyms of "${word}"*\n\n${d.map(w => w.word).join(' · ')}`);
    } catch { await reply('❌ Antonym lookup failed.'); }
  },
};

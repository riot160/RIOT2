// plugins/info/urban.js
import fetch from 'node-fetch';
export default {
  command: ['urban', 'ud', 'slang'],
  desc: 'Look up slang on Urban Dictionary — .urban salty',
  category: 'info',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .urban <word>\nExample: .urban salty');
    try {
      const res  = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(text)}`);
      const d    = await res.json();
      const def  = d.list?.[0];
      if (!def) return reply(`❌ No definition found for *${text}*`);
      const clean = (s) => s?.replace(/\[|\]/g, '') || '';
      await reply(
        `📖 *Urban Dictionary: ${text}*\n\n` +
        `📝 Definition:\n${clean(def.definition).slice(0, 400)}\n\n` +
        `💬 Example:\n_${clean(def.example).slice(0, 200)}_\n\n` +
        `👍 ${def.thumbs_up}  👎 ${def.thumbs_down}`
      );
    } catch (e) { await reply('❌ Urban Dictionary lookup failed: ' + e.message); }
  },
};

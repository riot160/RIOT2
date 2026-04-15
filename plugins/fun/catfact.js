// plugins/fun/catfact.js
import fetch from 'node-fetch';
export default {
  command: ['catfact', 'catfacts', 'meowfact'],
  desc: 'Get a random interesting cat fact — .catfact',
  category: 'fun',
  run: async ({ reply }) => {
    try {
      const res  = await fetch('https://catfact.ninja/fact');
      const d    = await res.json();
      await reply(`🐱 *Cat Fact*\n\n${d.fact}`);
    } catch { await reply('🐱 *Cat Fact*\n\nCats sleep 12–16 hours per day. That\'s a skill!'); }
  },
};

// plugins/tools/fact.js
import fetch from 'node-fetch';

export default {
  command: ['fact', 'funfact'],
  desc: 'Get a random interesting fact',
  category: 'tools',
  run: async ({ reply }) => {
    try {
      const res  = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
      const d    = await res.json();
      await reply(`🧠 *Random Fact*\n\n${d.text}`);
    } catch {
      await reply('❌ Could not fetch a fact right now. Try again.');
    }
  },
};

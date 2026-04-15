// plugins/fun/motivation.js
import fetch from 'node-fetch';
const FALLBACK = [
  'Believe you can and you\'re halfway there. — Theodore Roosevelt',
  'The only way to do great work is to love what you do. — Steve Jobs',
  'It does not matter how slowly you go as long as you do not stop. — Confucius',
  'Success is not final, failure is not fatal: it is the courage to continue that counts. — Churchill',
  'You are never too old to set another goal or to dream a new dream. — C.S. Lewis',
];
export default {
  command: ['motivation', 'motivate', 'inspire2'],
  desc: 'Get a powerful motivational message — .motivation',
  category: 'fun',
  run: async ({ reply }) => {
    try {
      const res   = await fetch('https://api.quotable.io/random?tags=inspirational|motivational');
      const d     = await res.json();
      if (!d.content) throw new Error();
      await reply(`💪 *Motivation*\n\n_"${d.content}"_\n\n— ${d.author}`);
    } catch {
      const q = FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
      const [text, author] = q.split(' — ');
      await reply(`💪 *Motivation*\n\n_"${text}"_\n\n— ${author || 'Unknown'}`);
    }
  },
};

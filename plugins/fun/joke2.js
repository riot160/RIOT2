// plugins/fun/joke2.js
import fetch from 'node-fetch';
export default {
  command: ['joke2', 'darkjoke', 'dryjoke'],
  desc: 'Get a random programming or dry humor joke — .joke2',
  category: 'fun',
  run: async ({ reply }) => {
    try {
      const res = await fetch('https://v2.jokeapi.dev/joke/Programming,Pun?blacklistFlags=nsfw,racist,sexist');
      const d   = await res.json();
      const text = d.type === 'twopart' ? `${d.setup}\n\n😄 ${d.delivery}` : d.joke;
      await reply(`😄 *Joke*\n\n${text}`);
    } catch {
      await reply('😄 *Joke*\n\nWhy do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛');
    }
  },
};

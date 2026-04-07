// plugins/fun/meme.js
import fetch from 'node-fetch';

export default {
  command: 'meme',
  desc: 'Get a random meme image',
  category: 'fun',
  run: async ({ sock, jid, msg, reply }) => {
    try {
      const res = await fetch('https://meme-api.com/gimme');
      const d   = await res.json();
      await sock.sendMessage(
        jid,
        { image: { url: d.url }, caption: `😂 *${d.title}*` },
        { quoted: msg }
      );
    } catch {
      await reply('❌ Could not fetch meme right now. Try again.');
    }
  },
};

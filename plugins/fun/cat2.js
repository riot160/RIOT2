// plugins/fun/cat2.js
import fetch from 'node-fetch';
export default {
  command: ['cat2', 'meow', 'kitty'],
  desc: 'Get a random cute cat image — .cat2',
  category: 'fun',
  run: async ({ sock, jid, msg, reply }) => {
    try {
      const res    = await fetch('https://api.thecatapi.com/v1/images/search');
      const d      = await res.json();
      const imgUrl = d[0]?.url;
      if (!imgUrl) throw new Error();
      const imgRes = await fetch(imgUrl);
      const buf    = Buffer.from(await imgRes.arrayBuffer());
      await sock.sendMessage(jid, { image: buf, caption: '🐱 *Meow!*' }, { quoted: msg });
    } catch { await reply('❌ Could not fetch cat image. Try again!'); }
  },
};

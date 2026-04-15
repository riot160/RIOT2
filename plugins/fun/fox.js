// plugins/fun/fox.js
import fetch from 'node-fetch';
export default {
  command: ['fox', 'foxpic'],
  desc: 'Get a random cute fox image — .fox',
  category: 'fun',
  run: async ({ sock, jid, msg, reply }) => {
    try {
      const res    = await fetch('https://randomfox.ca/floof/');
      const d      = await res.json();
      const imgRes = await fetch(d.image);
      const buf    = Buffer.from(await imgRes.arrayBuffer());
      await sock.sendMessage(jid, { image: buf, caption: '🦊 *What does the fox say?*' }, { quoted: msg });
    } catch { await reply('❌ Could not fetch fox image. Try again!'); }
  },
};

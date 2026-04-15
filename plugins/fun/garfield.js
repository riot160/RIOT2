// plugins/fun/garfield.js
import fetch from 'node-fetch';
export default {
  command: ['garfield', 'comic', 'garfieldcomic'],
  desc: 'Get a random Garfield comic strip — .garfield',
  category: 'fun',
  run: async ({ sock, jid, msg, reply }) => {
    await reply('📰 Fetching comic…');
    try {
      // Garfield API — random comic
      const start = new Date('1978-06-19').getTime();
      const end   = new Date().getTime();
      const rand  = new Date(start + Math.random() * (end - start));
      const y     = rand.getFullYear();
      const m     = String(rand.getMonth() + 1).padStart(2, '0');
      const d     = String(rand.getDate()).padStart(2, '0');
      const imgUrl = `https://d1ejxu6vysztl5.cloudfront.net/comics/garfield/${y}/${y}-${m}-${d}.jpg`;
      const res    = await fetch(imgUrl);
      if (!res.ok) throw new Error('No comic for this date');
      const buf    = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(jid,
        { image: buf, caption: `📰 *Garfield — ${y}-${m}-${d}*\n😸 _I hate Mondays._` },
        { quoted: msg }
      );
    } catch { await reply('❌ Could not fetch comic. Try again!'); }
  },
};

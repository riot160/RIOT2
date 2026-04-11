// plugins/tools/wallpaper.js
import fetch from 'node-fetch';

export default {
  command: ['wallpaper', 'wall', 'wp'],
  desc: 'Download a random wallpaper by topic — .wallpaper nature',
  category: 'tools',

  run: async ({ text, args, sock, jid, msg, reply }) => {
    const query = text || 'nature';
    await reply(`🖼️ Finding wallpaper: *${query}*…`);

    try {
      // Picsum for random, Unsplash-source for topic
      const url  = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(query)}&sig=${Date.now()}`;
      const res  = await fetch(url, { redirect: 'follow' });
      const buf  = Buffer.from(await res.arrayBuffer());

      await sock.sendMessage(
        jid,
        {
          image:   buf,
          caption: `🖼️ *Wallpaper: ${query}*\n_High quality 1920×1080_`,
        },
        { quoted: msg }
      );
    } catch (e) {
      // Fallback to Picsum random
      try {
        const res2 = await fetch(`https://picsum.photos/1920/1080?random=${Date.now()}`);
        const buf2 = Buffer.from(await res2.arrayBuffer());
        await sock.sendMessage(jid,
          { image: buf2, caption: `🖼️ *Random Wallpaper*` },
          { quoted: msg }
        );
      } catch {
        await reply('❌ Wallpaper download failed. Try again.');
      }
    }
  },
};

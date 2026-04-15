// plugins/info/anime.js
import fetch from 'node-fetch';
export default {
  command: ['anime', 'animesearch'],
  desc: 'Search anime info — .anime Naruto',
  category: 'info',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .anime <title>\nExample: .anime Naruto');
    await reply(`🔍 Searching anime: *${text}*…`);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(text)}&limit=1`);
      const d   = await res.json();
      const a   = d.data?.[0];
      if (!a) return reply(`❌ Anime *${text}* not found.`);
      const caption =
        `🎌 *${a.title}*\n` +
        `${'─'.repeat(28)}\n` +
        `📺 Type     : ${a.type || '—'}\n` +
        `📅 Aired    : ${a.aired?.string || '—'}\n` +
        `🎬 Episodes : ${a.episodes || 'Ongoing'}\n` +
        `⭐ Score    : ${a.score || '—'}/10\n` +
        `🏆 Rank     : #${a.rank || '—'}\n` +
        `📊 Status   : ${a.status || '—'}\n` +
        `🎭 Genres   : ${a.genres?.map(g => g.name).join(', ') || '—'}\n` +
        `${'─'.repeat(28)}\n` +
        `📝 ${a.synopsis?.slice(0, 200)}${a.synopsis?.length > 200 ? '…' : ''}`;
      if (a.images?.jpg?.image_url) {
        const imgRes = await fetch(a.images.jpg.image_url);
        const buf    = Buffer.from(await imgRes.arrayBuffer());
        await sock.sendMessage(jid, { image: buf, caption }, { quoted: msg });
      } else { await reply(caption); }
    } catch (e) { await reply('❌ Anime search failed: ' + e.message); }
  },
};

// plugins/info/manga.js
import fetch from 'node-fetch';
export default {
  command: ['manga', 'mangasearch'],
  desc: 'Search manga info — .manga One Piece',
  category: 'info',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .manga <title>\nExample: .manga One Piece');
    await reply(`🔍 Searching manga: *${text}*…`);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(text)}&limit=1`);
      const d   = await res.json();
      const m   = d.data?.[0];
      if (!m) return reply(`❌ Manga *${text}* not found.`);
      const caption =
        `📚 *${m.title}*\n` +
        `${'─'.repeat(28)}\n` +
        `📖 Type     : ${m.type || '—'}\n` +
        `📅 Published: ${m.published?.string || '—'}\n` +
        `📑 Chapters : ${m.chapters || 'Ongoing'}\n` +
        `📕 Volumes  : ${m.volumes || '—'}\n` +
        `⭐ Score    : ${m.score || '—'}/10\n` +
        `📊 Status   : ${m.status || '—'}\n` +
        `${'─'.repeat(28)}\n` +
        `📝 ${m.synopsis?.slice(0, 200)}…`;
      if (m.images?.jpg?.image_url) {
        const imgRes = await fetch(m.images.jpg.image_url);
        const buf    = Buffer.from(await imgRes.arrayBuffer());
        await sock.sendMessage(jid, { image: buf, caption }, { quoted: msg });
      } else { await reply(caption); }
    } catch (e) { await reply('❌ Manga search failed: ' + e.message); }
  },
};

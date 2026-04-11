// plugins/tools/imdb.js
import fetch from 'node-fetch';

export default {
  command: ['imdb', 'movie', 'film'],
  desc: 'Search movie or show info — .imdb Avengers',
  category: 'tools',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .imdb <movie or show name>\nExample: .imdb Avengers');
    await reply(`🎬 Searching: *${text}*…`);

    try {
      const res  = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(text)}&apikey=trilogy&plot=short`
      );
      const d    = await res.json();

      if (d.Response === 'False') {
        // Try search instead of exact match
        const res2 = await fetch(
          `https://www.omdbapi.com/?s=${encodeURIComponent(text)}&apikey=trilogy`
        );
        const d2   = await res2.json();
        if (d2.Response === 'False' || !d2.Search?.length)
          return reply(`❌ No results found for: *${text}*`);

        const first = d2.Search[0];
        const res3  = await fetch(`https://www.omdbapi.com/?i=${first.imdbID}&apikey=trilogy`);
        const d3    = await res3.json();
        return sendInfo(sock, jid, msg, reply, d3);
      }

      await sendInfo(sock, jid, msg, reply, d);
    } catch (e) {
      await reply('❌ IMDB search failed: ' + e.message);
    }
  },
};

async function sendInfo(sock, jid, msg, reply, d) {
  const caption =
    `🎬 *${d.Title}* (${d.Year})\n` +
    `${'─'.repeat(30)}\n` +
    `🎭 Type      : ${d.Type}\n` +
    `🗓️  Released  : ${d.Released}\n` +
    `⏱️  Runtime   : ${d.Runtime}\n` +
    `🎪 Genre     : ${d.Genre}\n` +
    `🌍 Language  : ${d.Language}\n` +
    `🏆 Awards    : ${d.Awards}\n` +
    `${'─'.repeat(30)}\n` +
    `⭐ IMDB      : ${d.imdbRating}/10 (${d.imdbVotes} votes)\n` +
    `🍅 Metascore : ${d.Metascore}\n` +
    `${'─'.repeat(30)}\n` +
    `🎬 Director  : ${d.Director}\n` +
    `✍️  Writer    : ${d.Writer}\n` +
    `🎭 Cast      : ${d.Actors}\n` +
    `${'─'.repeat(30)}\n` +
    `📝 Plot:\n${d.Plot}\n` +
    `${'─'.repeat(30)}\n` +
    `🔗 IMDB      : https://imdb.com/title/${d.imdbID}`;

  if (d.Poster && d.Poster !== 'N/A') {
    try {
      const imgRes = await fetch(d.Poster);
      const imgBuf = Buffer.from(await imgRes.arrayBuffer());
      await sock.sendMessage(jid, { image: imgBuf, caption }, { quoted: msg });
      return;
    } catch {}
  }
  await reply(caption);
}

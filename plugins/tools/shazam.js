// plugins/tools/shazam.js
import fetch from 'node-fetch';

export default {
  command: ['shazam', 'findsong', 'whatsong'],
  desc: 'Find a song by name/lyrics — .shazam <song fragment>',
  category: 'tools',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text)
      return reply('Usage: .shazam <song name or lyrics fragment>\nExample: .shazam we will rock you');

    await reply(`🎵 Searching: *${text}*…`);
    try {
      // Use audd.io free API
      const form = new URLSearchParams();
      form.append('q',          text);
      form.append('return',     'spotify,deezer,lyrics');
      form.append('api_token',  '');  // works without token for basic search

      const res  = await fetch('https://api.audd.io/', {
        method: 'POST',
        body:   form,
      });
      const d    = await res.json();

      if (d.status !== 'success' || !d.result) {
        // Fallback: search iTunes
        const res2 = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(text)}&limit=1&media=music`
        );
        const d2   = await res2.json();
        const t    = d2.results?.[0];
        if (!t) return reply(`❌ No song found for: *${text}*`);

        const caption =
          `🎵 *Song Found*\n\n` +
          `🎤 Title   : ${t.trackName}\n` +
          `👤 Artist  : ${t.artistName}\n` +
          `💿 Album   : ${t.collectionName}\n` +
          `📅 Year    : ${t.releaseDate?.slice(0, 4)}\n` +
          `🎭 Genre   : ${t.primaryGenreName}\n` +
          `⏱️  Duration: ${Math.floor(t.trackTimeMillis / 60000)}:${String(Math.floor((t.trackTimeMillis % 60000) / 1000)).padStart(2, '0')}\n` +
          `🔗 iTunes  : ${t.trackViewUrl}`;

        try {
          const imgRes = await fetch(t.artworkUrl100?.replace('100x100', '600x600'));
          const imgBuf = Buffer.from(await imgRes.arrayBuffer());
          await sock.sendMessage(jid, { image: imgBuf, caption }, { quoted: msg });
        } catch {
          await reply(caption);
        }
        return;
      }

      const r      = d.result;
      const caption =
        `🎵 *Song Found*\n\n` +
        `🎤 Title   : ${r.title}\n` +
        `👤 Artist  : ${r.artist}\n` +
        `💿 Album   : ${r.album || '—'}\n` +
        `📅 Year    : ${r.release_date || '—'}\n` +
        `${r.spotify ? `🎧 Spotify : ${r.spotify.external_urls?.spotify}\n` : ''}` +
        `${r.deezer  ? `🎵 Deezer  : ${r.deezer.link}\n`                : ''}`;

      await reply(caption);
    } catch (e) {
      await reply('❌ Song search failed: ' + e.message);
    }
  },
};

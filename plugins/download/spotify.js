// ═══════════════════════════════════════════════════
//  RIOT MD  ·  PLUGIN: Spotify Track Info
//  File: plugins/download/spotify.js
// ═══════════════════════════════════════════════════
import fetch from 'node-fetch';

export default {
  command: ['spotify', 'sp'],
  desc: 'Search Spotify track info — .spotify <song name>',
  category: 'download',

  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .spotify <song name>');

    await reply(`🎧 *Searching Spotify:* ${text}…`);

    try {
      const res = await fetch(
        `https://saavn.dev/api/search/songs?query=${encodeURIComponent(text)}&page=1&limit=1`
      );
      const d = await res.json();
      const track = d?.data?.results?.[0];

      if (!track) return reply(`❌ No results found for: *${text}*`);

      const artists = track.artists?.primary?.map(a => a.name).join(', ') || 'Unknown';
      const dur     = track.duration || 0;
      const mins    = Math.floor(dur / 60);
      const secs    = String(dur % 60).padStart(2, '0');

      await reply(
`🎵 *${track.name}*

👤 Artist   : ${artists}
💿 Album    : ${track.album?.name || 'Unknown'}
📅 Year     : ${track.year || 'Unknown'}
⏱️ Duration  : ${mins}:${secs}
🔗 Language : ${track.language || 'Unknown'}

_Searched by RIOT MD_`
      );
    } catch (e) {
      await reply(`❌ Spotify search failed:\n${e.message}`);
    }
  },
};

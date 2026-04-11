// plugins/tools/yts.js
import fetch from 'node-fetch';

export default {
  command: ['yts', 'ytsearch', 'youtube'],
  desc: 'Search YouTube and show results — .yts <query>',
  category: 'tools',

  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .yts <search query>\nExample: .yts Burna Boy last last');
    await reply(`🔍 Searching YouTube: *${text}*…`);

    try {
      // Use YouTube search via invidious public API
      const res  = await fetch(
        `https://inv.nadeko.net/api/v1/search?q=${encodeURIComponent(text)}&type=video&page=1`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' } }
      );
      const data = await res.json();

      if (!Array.isArray(data) || !data.length)
        return reply(`❌ No results found for: *${text}*`);

      const results = data.slice(0, 5);
      let msg = `🎬 *YouTube Results for:*\n_${text}_\n${'─'.repeat(28)}\n\n`;

      results.forEach((v, i) => {
        const dur  = v.lengthSeconds
          ? `${Math.floor(v.lengthSeconds / 60)}:${String(v.lengthSeconds % 60).padStart(2, '0')}`
          : '—';
        const views = v.viewCount >= 1_000_000
          ? (v.viewCount / 1_000_000).toFixed(1) + 'M views'
          : v.viewCount >= 1_000
            ? (v.viewCount / 1_000).toFixed(1) + 'K views'
            : `${v.viewCount || '?'} views`;
        msg +=
          `*${i + 1}.* ${v.title}\n` +
          `   👤 ${v.author}\n` +
          `   ⏱️ ${dur}  👁️ ${views}\n` +
          `   🔗 https://youtu.be/${v.videoId}\n\n`;
      });

      msg += `_Use .play <url> to download audio_\n_Use .ytmp4 <url> to download video_`;
      await reply(msg);
    } catch (e) {
      await reply('❌ YouTube search failed: ' + e.message);
    }
  },
};

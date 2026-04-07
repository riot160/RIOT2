// ═══════════════════════════════════════════════════
//  RIOT MD  ·  PLUGIN: TikTok Downloader
//  File: plugins/download/tiktok.js
// ═══════════════════════════════════════════════════
import fetch from 'node-fetch';

async function getBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  return Buffer.from(await res.arrayBuffer());
}

export default {
  command: ['tiktok', 'tt'],
  desc: 'Download TikTok video without watermark',
  category: 'download',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .tiktok <tiktok url>');

    await reply('⬇️ *Downloading TikTok video…*\nPlease wait.');

    try {
      // ── tikwm public API ──────────────────────────
      const res = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`
      );
      const d = await res.json();

      if (!d?.data?.play) {
        throw new Error(d?.msg || 'No video data returned');
      }

      const { play, title, author } = d.data;
      const buf = await getBuffer(play);

      await sock.sendMessage(
        jid,
        {
          video: buf,
          caption:
            `🎵 *${title || 'TikTok Video'}*\n` +
            `👤 @${author?.unique_id || 'unknown'}\n\n` +
            `_Downloaded by RIOT MD_`,
        },
        { quoted: msg }
      );
    } catch (e) {
      await reply(`❌ TikTok download failed:\n${e.message}`);
    }
  },
};

// plugins/download/tiktokaudio.js
import fetch from 'node-fetch';
import fs    from 'fs-extra';
import path  from 'path';
import { randomUUID } from 'crypto';

const TMP = '/tmp/riotmd';

export default {
  command: ['tiktokaudio', 'ttaudio', 'ttmp3'],
  desc: 'Download TikTok video audio only — .tiktokaudio <url>',
  category: 'download',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .tiktokaudio <tiktok url>');
    await reply('🎵 Extracting TikTok audio…');
    try {
      const res  = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const d    = await res.json();
      if (!d?.data?.music) throw new Error('No audio found');

      const musicUrl = d.data.music;
      const title    = d.data.music_info?.title || 'TikTok Audio';
      const author   = d.data.music_info?.author || d.data.author?.unique_id || '—';

      const dlRes = await fetch(musicUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const buf   = Buffer.from(await dlRes.arrayBuffer());

      await sock.sendMessage(jid, {
        audio:    buf,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
      }, { quoted: msg });

      await reply(`✅ *${title}*\n👤 ${author}`);
    } catch (e) {
      await reply('❌ TikTok audio download failed: ' + e.message);
    }
  },
};

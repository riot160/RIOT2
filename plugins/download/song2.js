// plugins/download/song2.js
import fetch from 'node-fetch';
import { exec }      from 'child_process';
import { promisify } from 'util';
import fs            from 'fs-extra';
import path          from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['song2', 'saavn', 'jiosaavn'],
  desc: 'Search and download from JioSaavn — .song2 <song name>',
  category: 'download',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .song2 <song name>\nExample: .song2 Tum Hi Ho');
    await reply(`🎵 Searching JioSaavn: *${text}*…`);
    try {
      const res  = await fetch(
        `https://saavn.dev/api/search/songs?query=${encodeURIComponent(text)}&limit=1`
      );
      const d    = await res.json();
      const song = d?.data?.results?.[0];
      if (!song) return reply(`❌ Song not found: *${text}*`);

      const downloadUrl = song.downloadUrl?.find(u => u.quality === '160kbps')?.url
        || song.downloadUrl?.[0]?.url;
      if (!downloadUrl) return reply('❌ No download link found for this song.');

      await reply(`⬇️ Downloading: *${song.name}*…`);
      await fs.ensureDir(TMP);

      const id  = randomUUID().slice(0, 8);
      const out = path.join(TMP, `${id}.mp4`);
      await execAsync(`yt-dlp -x --audio-format mp3 -o "${out}" "${downloadUrl}"`, { timeout: 60000 });

      let buf;
      if (await fs.pathExists(out)) {
        buf = await fs.readFile(out);
      } else {
        // Try direct fetch
        const dlRes = await fetch(downloadUrl);
        buf = Buffer.from(await dlRes.arrayBuffer());
      }

      const artists = song.artists?.primary?.map(a => a.name).join(', ') || '—';
      await sock.sendMessage(jid, {
        audio:    buf,
        mimetype: 'audio/mpeg',
        fileName: `${song.name}.mp3`,
      }, { quoted: msg });

      await reply(
        `✅ *${song.name}*\n` +
        `👤 ${artists}\n` +
        `💿 ${song.album?.name || '—'}`
      );
      await fs.remove(out).catch(() => {});
    } catch (e) {
      await reply('❌ Download failed: ' + e.message);
    }
  },
};

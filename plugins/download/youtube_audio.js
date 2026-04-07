// ═══════════════════════════════════════════════════
//  RIOT MD  ·  PLUGIN: YouTube Audio (MP3)
//  File: plugins/download/youtube_audio.js
// ═══════════════════════════════════════════════════
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['play', 'ytmp3', 'music', 'song'],
  desc: 'Download YouTube audio — .play <song name or URL>',
  category: 'download',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .play <song name or YouTube URL>');

    await reply(`🎵 *Searching:* ${text}\nPlease wait…`);

    await fs.ensureDir(TMP);
    const id  = randomUUID().slice(0, 8);
    const out = path.join(TMP, `${id}.mp3`);

    try {
      // If it's a search term (not a URL), prefix with ytsearch:
      const input = text.startsWith('http') ? text : `ytsearch1:${text}`;

      await execAsync(
        `yt-dlp -x --audio-format mp3 --audio-quality 0 \
         -o "${out}" "${input}" --no-playlist`,
        { timeout: 90000 }
      );

      if (!(await fs.pathExists(out))) throw new Error('File not found after download');

      const buf      = await fs.readFile(out);
      const sizeMB   = (buf.length / 1024 / 1024).toFixed(1);

      await sock.sendMessage(
        jid,
        {
          audio:    buf,
          mimetype: 'audio/mpeg',
          fileName: `${text.slice(0, 40)}.mp3`,
        },
        { quoted: msg }
      );

      await reply(`✅ *Done!* (${sizeMB} MB)\n_Downloaded by RIOT MD_`);
      await fs.remove(out);
    } catch (e) {
      await reply(
        `❌ Audio download failed:\n${e.message}\n\n` +
        `Tip: Make sure yt-dlp & ffmpeg are installed.`
      );
    }
  },
};

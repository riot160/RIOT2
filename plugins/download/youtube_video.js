// ═══════════════════════════════════════════════════
//  RIOT MD  ·  PLUGIN: YouTube Video (MP4)
//  File: plugins/download/youtube_video.js
// ═══════════════════════════════════════════════════
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['ytmp4', 'ytvideo', 'video'],
  desc: 'Download YouTube video — .ytmp4 <URL>',
  category: 'download',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .ytmp4 <YouTube URL>');

    await reply('🎬 *Downloading YouTube video…*\nPlease wait (this can take a moment).');

    await fs.ensureDir(TMP);
    const id  = randomUUID().slice(0, 8);
    const out = path.join(TMP, `${id}.mp4`);

    try {
      await execAsync(
        `yt-dlp -f "best[height<=480][ext=mp4]" \
         -o "${out}" "${text}" --no-playlist`,
        { timeout: 120000 }
      );

      if (!(await fs.pathExists(out))) throw new Error('File not found after download');

      const buf    = await fs.readFile(out);
      const sizeMB = (buf.length / 1024 / 1024).toFixed(1);

      if (buf.length > 64 * 1024 * 1024) {
        await fs.remove(out);
        return reply('❌ Video is too large to send via WhatsApp (max ~64 MB).\nTry a shorter video.');
      }

      await sock.sendMessage(
        jid,
        {
          video:   buf,
          caption: `🎬 *YouTube Video*\n${text}\n\n_Downloaded by RIOT MD_`,
        },
        { quoted: msg }
      );

      await reply(`✅ *Done!* (${sizeMB} MB)`);
      await fs.remove(out);
    } catch (e) {
      await reply(`❌ Video download failed:\n${e.message}`);
    }
  },
};

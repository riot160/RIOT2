// ═══════════════════════════════════════════════════
//  RIOT MD  ·  PLUGIN: Instagram Downloader
//  File: plugins/download/instagram.js
// ═══════════════════════════════════════════════════
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['instagram', 'ig', 'insta'],
  desc: 'Download Instagram post, reel or story',
  category: 'download',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .instagram <instagram url>');

    await reply('📸 *Downloading Instagram media…*\nPlease wait.');

    await fs.ensureDir(TMP);
    const id  = randomUUID().slice(0, 8);
    const out = path.join(TMP, `${id}.%(ext)s`);

    try {
      // ── yt-dlp handles Instagram reels, posts, stories ──
      await execAsync(
        `yt-dlp -o "${out}" "${text}" --no-playlist`,
        { timeout: 60000 }
      );

      const files = (await fs.readdir(TMP)).filter(f => f.startsWith(id));
      if (!files.length) throw new Error('No file was downloaded');

      const filePath = path.join(TMP, files[0]);
      const buf      = await fs.readFile(filePath);
      const isVideo  = /\.(mp4|mov|webm)$/i.test(filePath);

      await sock.sendMessage(
        jid,
        isVideo
          ? { video: buf, caption: '📸 *Instagram Reel/Video*\n\n_Downloaded by RIOT MD_' }
          : { image: buf, caption: '📸 *Instagram Photo*\n\n_Downloaded by RIOT MD_' },
        { quoted: msg }
      );

      // clean up temp file
      await fs.remove(filePath);
    } catch (e) {
      await reply(
        `❌ Instagram download failed:\n${e.message}\n\n` +
        `Make sure yt-dlp is installed:\n\`pip install yt-dlp\``
      );
    }
  },
};

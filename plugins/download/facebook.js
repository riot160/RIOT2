// ═══════════════════════════════════════════════════
//  RIOT MD  ·  PLUGIN: Facebook Video Downloader
//  File: plugins/download/facebook.js
// ═══════════════════════════════════════════════════
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['facebook', 'fb', 'fbvideo'],
  desc: 'Download Facebook video — .facebook <url>',
  category: 'download',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .facebook <facebook video url>');

    await reply('📥 *Downloading Facebook video…*\nPlease wait.');

    await fs.ensureDir(TMP);
    const id  = randomUUID().slice(0, 8);
    const out = path.join(TMP, `${id}.mp4`);

    try {
      await execAsync(
        `yt-dlp -f "best[height<=480]" -o "${out}" "${text}"`,
        { timeout: 90000 }
      );

      if (!(await fs.pathExists(out))) throw new Error('No file downloaded');

      const buf    = await fs.readFile(out);
      const sizeMB = (buf.length / 1024 / 1024).toFixed(1);

      if (buf.length > 64 * 1024 * 1024) {
        await fs.remove(out);
        return reply('❌ Video too large to send (max ~64 MB).');
      }

      await sock.sendMessage(
        jid,
        { video: buf, caption: `📘 *Facebook Video*\n_Downloaded by RIOT MD_` },
        { quoted: msg }
      );

      await reply(`✅ Done! (${sizeMB} MB)`);
      await fs.remove(out);
    } catch (e) {
      await reply(`❌ Facebook download failed:\n${e.message}`);
    }
  },
};

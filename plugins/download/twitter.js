// ═══════════════════════════════════════════════════
//  RIOT MD  ·  PLUGIN: Twitter / X Downloader
//  File: plugins/download/twitter.js
// ═══════════════════════════════════════════════════
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['twitter', 'twit', 'xvideo'],
  desc: 'Download Twitter/X video — .twitter <url>',
  category: 'download',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .twitter <tweet url>');

    await reply('🐦 *Downloading Twitter/X video…*\nPlease wait.');

    await fs.ensureDir(TMP);
    const id  = randomUUID().slice(0, 8);
    const out = path.join(TMP, `${id}.mp4`);

    try {
      await execAsync(
        `yt-dlp -f "best" -o "${out}" "${text}"`,
        { timeout: 60000 }
      );

      if (!(await fs.pathExists(out))) throw new Error('No file downloaded');

      const buf    = await fs.readFile(out);
      const sizeMB = (buf.length / 1024 / 1024).toFixed(1);

      await sock.sendMessage(
        jid,
        { video: buf, caption: `🐦 *Twitter / X Video*\n_Downloaded by RIOT MD_` },
        { quoted: msg }
      );

      await reply(`✅ Done! (${sizeMB} MB)`);
      await fs.remove(out);
    } catch (e) {
      await reply(`❌ Twitter download failed:\n${e.message}`);
    }
  },
};

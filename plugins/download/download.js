// plugins/download/download.js
import { exec }      from 'child_process';
import { promisify } from 'util';
import fs            from 'fs-extra';
import path          from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['download', 'dl'],
  desc: 'Universal media downloader — .download <any video url>',
  category: 'download',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text || !text.startsWith('http'))
      return reply(
        'Usage: .download <url>\n\n' +
        'Supports: YouTube, TikTok, Instagram, Facebook, Twitter, Pinterest, and 1000+ sites'
      );
    await reply('⬇️ Downloading media… please wait.');
    await fs.ensureDir(TMP);
    const id  = randomUUID().slice(0, 8);
    const out = path.join(TMP, `${id}.%(ext)s`);
    try {
      await execAsync(
        `yt-dlp -f "best[height<=480][ext=mp4]/best[height<=480]/best" -o "${out}" "${text}" --no-playlist`,
        { timeout: 120000 }
      );
      const files = (await fs.readdir(TMP)).filter(f => f.startsWith(id));
      if (!files.length) throw new Error('No file downloaded');
      const file    = path.join(TMP, files[0]);
      const buf     = await fs.readFile(file);
      const sizeMB  = (buf.length / 1024 / 1024).toFixed(1);
      if (buf.length > 64 * 1024 * 1024) {
        await fs.remove(file);
        return reply('❌ File too large (>64MB). Try a shorter video.');
      }
      const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(file);
      await sock.sendMessage(jid,
        isVideo
          ? { video: buf, caption: `⬇️ Downloaded (${sizeMB} MB)` }
          : { audio: buf, mimetype: 'audio/mpeg' },
        { quoted: msg }
      );
      await fs.remove(file);
    } catch (e) {
      await reply('❌ Download failed: ' + e.message);
    }
  },
};

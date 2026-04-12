// plugins/download/pin.js
import { exec }      from 'child_process';
import { promisify } from 'util';
import fs            from 'fs-extra';
import path          from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['pin', 'pinterest'],
  desc: 'Download a Pinterest image or video — .pin <url>',
  category: 'download',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text || !text.includes('pinterest'))
      return reply('Usage: .pin <pinterest url>\nExample: .pin https://pin.it/XXXXX');
    await reply('📌 Downloading Pinterest media…');
    await fs.ensureDir(TMP);
    const id  = randomUUID().slice(0, 8);
    const out = path.join(TMP, `${id}.%(ext)s`);
    try {
      await execAsync(`yt-dlp -o "${out}" "${text}"`, { timeout: 60000 });
      const files = (await fs.readdir(TMP)).filter(f => f.startsWith(id));
      if (!files.length) throw new Error('No file downloaded');
      const file    = path.join(TMP, files[0]);
      const buf     = await fs.readFile(file);
      const isVideo = /\.(mp4|mov|webm)$/i.test(file);
      await sock.sendMessage(jid,
        isVideo
          ? { video: buf, caption: '📌 Pinterest Video' }
          : { image: buf, caption: '📌 Pinterest Image' },
        { quoted: msg }
      );
      await fs.remove(file);
    } catch (e) {
      await reply('❌ Pinterest download failed: ' + e.message);
    }
  },
};

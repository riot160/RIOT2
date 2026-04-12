// plugins/download/tovideo.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec }   from 'child_process';
import { promisify } from 'util';
import fs   from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

// Simple black background image (1x1 pixel PNG in base64)
const BLACK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

export default {
  command: ['tovideo', 'audiotovideo'],
  desc: 'Convert quoted audio to MP4 video — reply to audio with .tovideo',
  category: 'download',
  run: async ({ sock, jid, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const audMsg = quoted?.audioMessage || msg.message?.audioMessage;
    if (!audMsg) return reply('Reply to an *audio* with *.tovideo* to convert it to video.');

    await reply('🔄 Converting audio to video…');
    await fs.ensureDir(TMP);

    const id  = randomUUID().slice(0, 8);
    const aud = path.join(TMP, `${id}.mp3`);
    const img = path.join(TMP, `${id}.png`);
    const vid = path.join(TMP, `${id}.mp4`);

    try {
      const stream = await downloadContentFromMessage(audMsg, 'audio');
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      await fs.writeFile(aud, Buffer.concat(chunks));
      await fs.writeFile(img, BLACK_PNG);

      await execAsync(
        `ffmpeg -loop 1 -i "${img}" -i "${aud}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${vid}"`,
        { timeout: 90000 }
      );

      const buf = await fs.readFile(vid);
      await sock.sendMessage(jid,
        { video: buf, caption: '🎵 Audio converted to video' },
        { quoted: msg }
      );
      await fs.remove(aud); await fs.remove(img); await fs.remove(vid);
    } catch (e) {
      await reply('❌ Conversion failed: ' + e.message);
    }
  },
};

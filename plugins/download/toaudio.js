// plugins/download/toaudio.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec }   from 'child_process';
import { promisify } from 'util';
import fs   from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);
const TMP = '/tmp/riotmd';

export default {
  command: ['toaudio', 'tomp3', 'converttaudio'],
  desc: 'Convert a quoted video to audio/mp3 — reply to video with .toaudio',
  category: 'download',
  run: async ({ sock, jid, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    if (!quoted?.videoMessage && !msg.message?.videoMessage)
      return reply('Reply to a *video* with *.toaudio* to convert it to audio.');

    const vidMsg = quoted?.videoMessage || msg.message?.videoMessage;
    await reply('🔄 Converting video to audio…');
    await fs.ensureDir(TMP);

    const id   = randomUUID().slice(0, 8);
    const vid  = path.join(TMP, `${id}.mp4`);
    const aud  = path.join(TMP, `${id}.mp3`);

    try {
      const stream = await downloadContentFromMessage(vidMsg, 'video');
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      await fs.writeFile(vid, Buffer.concat(chunks));

      await execAsync(`ffmpeg -i "${vid}" -vn -ar 44100 -ac 2 -b:a 192k "${aud}"`, { timeout: 60000 });

      const buf = await fs.readFile(aud);
      await sock.sendMessage(jid,
        { audio: buf, mimetype: 'audio/mpeg', fileName: 'converted.mp3' },
        { quoted: msg }
      );
      await fs.remove(vid); await fs.remove(aud);
    } catch (e) {
      await reply('❌ Conversion failed: ' + e.message);
      await fs.remove(vid).catch(() => {}); await fs.remove(aud).catch(() => {});
    }
  },
};

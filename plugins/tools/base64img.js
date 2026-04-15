// plugins/tools/base64img.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
export default {
  command: ['base64img', 'imgbase64'],
  desc: 'Convert a quoted image to base64 string — reply with .base64img',
  category: 'tools',
  run: async ({ sock, jid, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
    if (!imgMsg) return reply('Reply to an *image* with .base64img');
    await reply('🔄 Converting image to base64…');
    try {
      const stream = await downloadContentFromMessage(imgMsg, 'image');
      const chunks = []; for await (const c of stream) chunks.push(c);
      const b64    = Buffer.concat(chunks).toString('base64');
      const prefix = `data:image/jpeg;base64,`;
      const full   = prefix + b64;
      await sock.sendMessage(jid, {
        document: Buffer.from(full, 'utf8'),
        mimetype: 'text/plain',
        fileName: 'image_base64.txt',
        caption:  `📄 Base64 string (${b64.length} chars)`,
      }, { quoted: msg });
    } catch (e) { await reply('❌ Conversion failed: ' + e.message); }
  },
};

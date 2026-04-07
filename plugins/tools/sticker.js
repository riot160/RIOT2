// plugins/tools/sticker.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  command: ['sticker', 'stk', 's'],
  desc: 'Convert an image or video to a WhatsApp sticker — reply with .sticker',
  category: 'tools',
  run: async ({ sock, jid, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    if (!quoted) return reply('Reply to an image or short video with *.sticker*');

    const type = quoted.imageMessage   ? 'imageMessage'
               : quoted.videoMessage   ? 'videoMessage'
               : quoted.stickerMessage ? 'stickerMessage'
               : null;

    if (!type) return reply('❌ Reply to an *image* or *video* to make a sticker.');

    try {
      const mediaType = type.replace('Message', '');
      const stream    = await downloadContentFromMessage(quoted[type], mediaType);
      const chunks    = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buf = Buffer.concat(chunks);

      await sock.sendMessage(
        jid,
        { sticker: buf },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ Sticker conversion failed: ' + e.message);
    }
  },
};

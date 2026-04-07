// plugins/tools/toimg.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  command: ['toimg', 'toimage', 'stickertoimg'],
  desc: 'Convert a sticker back to an image — reply with .toimg',
  category: 'tools',
  run: async ({ sock, jid, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    if (!quoted?.stickerMessage) return reply('Reply to a *sticker* with *.toimg*');
    try {
      const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buf = Buffer.concat(chunks);
      await sock.sendMessage(
        jid,
        { image: buf, caption: '🖼️ Sticker converted to image' },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ Conversion failed: ' + e.message);
    }
  },
};

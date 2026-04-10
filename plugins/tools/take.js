// plugins/tools/take.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { config } from '../../config.js';

export default {
  command: ['take', 'save', 'forward'],
  desc: 'Save quoted media and forward to your DM — reply with .take',
  category: 'tools',
  run: async ({ sock, msg, senderNumber, pushName, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    if (!quoted)
      return reply(
        'Reply to any image, video, audio, or document with *.take* to save it to your DM.'
      );

    const typeMap = {
      imageMessage:    'image',
      videoMessage:    'video',
      audioMessage:    'audio',
      documentMessage: 'document',
      stickerMessage:  'sticker',
    };
    const msgKey  = Object.keys(quoted).find(k => typeMap[k]);
    if (!msgKey)
      return reply('❌ No supported media found in the quoted message.');

    const mediaType = typeMap[msgKey];
    await reply('⬆️ Saving media to your DM…');

    try {
      const stream = await downloadContentFromMessage(quoted[msgKey], mediaType);
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buf = Buffer.concat(chunks);

      const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
      const caption  = `💾 *Saved Media*\n👤 Saved by: ${pushName} (+${senderNumber})`;

      const payload = mediaType === 'image'    ? { image:    buf, caption } :
                      mediaType === 'video'    ? { video:    buf, caption } :
                      mediaType === 'audio'    ? { audio:    buf, mimetype: 'audio/mpeg' } :
                      mediaType === 'sticker'  ? { sticker:  buf } :
                      { document: buf, caption, mimetype: quoted[msgKey]?.mimetype || 'application/octet-stream',
                        fileName: quoted[msgKey]?.fileName || 'file' };

      await sock.sendMessage(ownerJid, payload);
      await reply('✅ *Saved!* Media sent to your DM.');
    } catch (e) {
      await reply('❌ Failed to save media: ' + e.message);
    }
  },
};

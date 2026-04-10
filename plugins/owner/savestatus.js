// plugins/owner/savestatus.js
// Saves a quoted status media to your own DM
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { config } from '../../config.js';

export default {
  command: ['savestatus', 'dlstatus'],
  desc: 'Save a quoted status media to your DM — reply to any status with .savestatus',
  category: 'owner',
  owner: true,
  run: async ({ sock, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    if (!quoted)
      return reply(
        '📥 *How to save a status:*\n\n' +
        '1. Open someone\'s WhatsApp status\n' +
        '2. Forward/quote it to the bot chat\n' +
        '3. Reply to it with *.savestatus*\n\n' +
        '_Or turn on .autosavestatus for automatic saving_'
      );

    const typeMap = {
      imageMessage: 'image',
      videoMessage: 'video',
    };
    const msgKey    = Object.keys(quoted).find(k => typeMap[k]);
    const mediaType = typeMap[msgKey];
    if (!msgKey || !mediaType)
      return reply('❌ No image or video found in the quoted message.');

    await reply('⬇️ Saving status…');
    try {
      const stream = await downloadContentFromMessage(quoted[msgKey], mediaType);
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      const buf      = Buffer.concat(chunks);
      const cap      = quoted[msgKey]?.caption || '';
      const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
      await sock.sendMessage(ownerJid, {
        [mediaType]: buf,
        caption: `📥 *Status Saved*${cap ? `\n📝 ${cap}` : ''}`,
      });
      await reply('✅ Status saved to your DM!');
    } catch (e) {
      await reply('❌ Failed to save: ' + e.message);
    }
  },
};

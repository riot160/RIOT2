// plugins/owner/setprofilepic.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  command: ['setprofilepic', 'setpp', 'setavatar'],
  desc: 'Set the bot\'s WhatsApp profile picture — reply to an image',
  category: 'owner',
  owner: true,
  run: async ({ sock, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const imgMsg = msg.message?.imageMessage || quoted?.imageMessage;

    if (!imgMsg)
      return reply('Reply to an image with .setprofilepic to set it as the bot\'s profile picture.');

    await reply('🖼️ Setting profile picture…');
    try {
      const stream = await downloadContentFromMessage(imgMsg, 'image');
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      const buf = Buffer.concat(chunks);
      await sock.updateProfilePicture(sock.user.id, buf);
      await reply('✅ *Profile picture updated!*');
    } catch (e) {
      await reply('❌ Failed to set profile picture: ' + e.message);
    }
  },
};

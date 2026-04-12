// plugins/group/setppgroup.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  command: ['setppgroup', 'setgrouppp', 'grouppic'],
  desc: 'Set the group profile picture — reply to image with .setppgroup',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const imgMsg = msg.message?.imageMessage || quoted?.imageMessage;
    if (!imgMsg) return reply('Reply to an *image* with .setppgroup to set it as the group picture.');
    await reply('🖼️ Setting group picture…');
    try {
      const stream = await downloadContentFromMessage(imgMsg, 'image');
      const chunks = []; for await (const c of stream) chunks.push(c);
      await sock.updateProfilePicture(jid, Buffer.concat(chunks));
      await reply('✅ *Group profile picture updated!*');
    } catch (e) {
      await reply('❌ Failed to set group picture: ' + e.message);
    }
  },
};

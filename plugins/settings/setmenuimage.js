// plugins/settings/setmenuimage.js
import { dbGet, dbSet } from '../../lib/database.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  command: 'setmenuimage',
  desc: 'Set a custom image shown when .menu is used — reply to an image with .setmenuimage',
  category: 'settings',
  owner: true,
  run: async ({ msg, userId, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted?.imageMessage)
      return reply('Reply to an *image* with .setmenuimage\nThat image will be shown every time .menu is used.');

    try {
      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buf = Buffer.concat(chunks);

      const s = (await dbGet(`settings:${userId}`)) || {};
      s.menuImage = buf.toString('base64');
      await dbSet(`settings:${userId}`, s);
      await reply('✅ *Menu Image Set*\n\nThis image will now appear with every .menu command.\nUse .setmenuimage again to change it.');
    } catch (e) {
      await reply('❌ Failed to save menu image: ' + e.message);
    }
  },
};

// plugins/settings/setmenu.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setmenu',
  desc: 'Set a custom text shown at the top of .menu — .setmenu Welcome to my bot!',
  category: 'settings',
  owner: true,
  run: async ({ text, userId, reply }) => {
    if (!text)
      return reply(
        'Usage: .setmenu <text>\n\n' +
        'Example:\n.setmenu 🔥 Welcome to RIOT MD!\nThe best WhatsApp bot.\n\n' +
        'This text will appear at the top of .menu output.'
      );
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.customMenuHeader = text;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Menu Header Set*\n\nPreview:\n\n${text}\n\n_Type .menu to see it live._`);
  },
};

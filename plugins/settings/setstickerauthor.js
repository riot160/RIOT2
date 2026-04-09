// plugins/settings/setstickerauthor.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setstickerauthor',
  desc: 'Set the sticker author name — .setstickerauthor Sydney',
  category: 'settings',
  owner: true,
  run: async ({ text, userId, reply }) => {
    if (!text)
      return reply('Usage: .setstickerauthor <name>\nExample: .setstickerauthor Sydney Sider');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.stickerAuthor = text;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Sticker Author Set*\n\nAuthor: *${text}*\nThis will appear in WhatsApp sticker details.`);
  },
};

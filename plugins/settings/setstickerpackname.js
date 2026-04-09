// plugins/settings/setstickerpackname.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setstickerpackname',
  desc: 'Set the sticker pack name — .setstickerpackname RIOT Stickers',
  category: 'settings',
  owner: true,
  run: async ({ text, userId, reply }) => {
    if (!text)
      return reply('Usage: .setstickerpackname <name>\nExample: .setstickerpackname RIOT Stickers');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.stickerPackName = text;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Sticker Pack Name Set*\n\nPack: *${text}*\nThis appears in WhatsApp sticker info.`);
  },
};

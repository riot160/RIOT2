// plugins/settings/setwatermark.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setwatermark',
  desc: 'Set the sticker watermark text — .setwatermark RIOT MD',
  category: 'settings',
  owner: true,
  run: async ({ text, userId, reply }) => {
    if (!text)
      return reply('Usage: .setwatermark <text>\nExample: .setwatermark RIOT MD ⚡\nThis appears on stickers you create.');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.watermark = text;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Watermark Set*\n\nText: *${text}*\nThis will appear on all stickers made with .sticker`);
  },
};

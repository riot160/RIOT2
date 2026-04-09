// plugins/settings/setownername.js
import { config } from '../../config.js';
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setownername',
  desc: 'Change the owner name shown in menu — .setownername Sydney',
  category: 'settings',
  owner: true,
  run: async ({ text, userId, reply }) => {
    if (!text)
      return reply('Usage: .setownername <name>\nExample: .setownername Sydney Sider');
    config.OWNER_NAME = text;
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.ownerName = text;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Owner Name Set*\n\nName: *${text}*\nThis will show in .menu and bot info.`);
  },
};

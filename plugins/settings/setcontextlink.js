// plugins/settings/setcontextlink.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setcontextlink',
  desc: 'Set the link shown in bot message context info — .setcontextlink https://...',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const url = args[0];
    if (!url || !url.startsWith('http'))
      return reply('Usage: .setcontextlink <url>\nExample: .setcontextlink https://github.com/your-repo\nMust start with https://');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.contextLink = url;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Context Link Set*\n\n🔗 ${url}\n\nThis link will appear in the context info of bot messages.`);
  },
};

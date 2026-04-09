// plugins/settings/autoread.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'autoread',
  desc: 'Automatically mark messages as read — .autoread on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .autoread on\n       .autoread off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autoread = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.autoread
      ? '👁️ *Auto Read → ON*\nAll messages will be marked as read automatically.'
      : '👁️ *Auto Read → OFF*\nMessages will not be auto-read.'
    );
  },
};

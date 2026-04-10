// plugins/settings/autosavestatus.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'autosavestatus',
  desc: 'Forward all status media to your DM — .autosavestatus on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(val))
      return reply('Usage: .autosavestatus on\n       .autosavestatus off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autosavestatus = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.autosavestatus
      ? '💾 *Auto Save Status → ON*\nAll image and video statuses will be saved to your DM.'
      : '💾 *Auto Save Status → OFF*\nStatus saving disabled.'
    );
  },
};

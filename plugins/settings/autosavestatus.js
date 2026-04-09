// plugins/settings/autosavestatus.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'autosavestatus',
  desc: 'Forward status media to your DM automatically — .autosavestatus on/off',
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
      ? '💾 *Auto Save Status → ON*\nAll image and video statuses will be forwarded to your DM automatically.'
      : '💾 *Auto Save Status → OFF*\nStatus media will no longer be auto-saved.'
    );
  },
};

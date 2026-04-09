// plugins/settings/autoreactstatus.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'autoreactstatus',
  desc: 'Automatically react to every status — .autoreactstatus on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .autoreactstatus on\n       .autoreactstatus off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autoreactstatus = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.autoreactstatus
      ? `🔥 *Auto React Status → ON*\nBot will react with ${s.statusEmoji || '🔥'} to every status.\nChange emoji: .setstatusemoji <emoji>`
      : '🔥 *Auto React Status → OFF*\nAuto status reactions disabled.'
    );
  },
};

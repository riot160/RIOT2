// plugins/settings/antiviewonce.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'antiviewonce',
  desc: 'Save view-once media before it disappears — .antiviewonce on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .antiviewonce on\n       .antiviewonce off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.antiviewonce = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.antiviewonce
      ? '🔓 *Anti View-Once → ON*\nView-once images and videos will be re-sent normally so you can view them anytime.'
      : '🔓 *Anti View-Once → OFF*\nView-once media will behave normally.'
    );
  },
};

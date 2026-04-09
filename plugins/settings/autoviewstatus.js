// plugins/settings/autoviewstatus.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'autoviewstatus',
  desc: 'Automatically view all WhatsApp statuses — .autoviewstatus on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .autoviewstatus on\n       .autoviewstatus off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autoviewstatus = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.autoviewstatus
      ? '👀 *Auto View Status → ON*\nBot will automatically view all contacts\' statuses.'
      : '👀 *Auto View Status → OFF*\nStatuses will not be auto-viewed.'
    );
  },
};

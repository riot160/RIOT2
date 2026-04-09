// plugins/settings/autoblock.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'autoblock',
  desc: 'Auto block numbers not in your contacts — .autoblock on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .autoblock on\n       .autoblock off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autoblock = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.autoblock
      ? '🚫 *Auto Block → ON*\n⚠️ Warning: Unknown numbers who message you will be automatically blocked.'
      : '🚫 *Auto Block → OFF*\nAuto-block disabled. All numbers can message you.'
    );
  },
};

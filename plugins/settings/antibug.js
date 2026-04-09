// plugins/settings/antibug.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'antibug',
  desc: 'Filter messages that could crash the bot — .antibug on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .antibug on\n       .antibug off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.antibug = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.antibug
      ? '🐛 *Anti Bug → ON*\nMalformed and crash-inducing messages will be filtered out.'
      : '🐛 *Anti Bug → OFF*\nBug filter disabled.'
    );
  },
};

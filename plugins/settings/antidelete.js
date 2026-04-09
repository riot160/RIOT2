// plugins/settings/antidelete.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'antidelete',
  desc: 'Re-send messages that are deleted — .antidelete on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .antidelete on\n       .antidelete off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.antidelete = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.antidelete
      ? '🛡️ *Anti Delete → ON*\nWhen someone deletes a message, I will re-send it to the chat.'
      : '🛡️ *Anti Delete → OFF*\nDeleted messages will be ignored.'
    );
  },
};

// plugins/settings/antiedit.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'antiedit',
  desc: 'Show original message when someone edits it — .antiedit on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .antiedit on\n       .antiedit off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.antiedit = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.antiedit
      ? '✏️ *Anti Edit → ON*\nWhen someone edits a message, I will show the original text.'
      : '✏️ *Anti Edit → OFF*\nEdited message tracking disabled.'
    );
  },
};

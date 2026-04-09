// plugins/settings/antideletestatus.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'antideletestatus',
  desc: 'Save statuses before they are deleted — .antideletestatus on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .antideletestatus on\n       .antideletestatus off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.antideletestatus = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.antideletestatus
      ? '🛡️ *Anti Delete Status → ON*\nStatus media will be saved to your DM before deletion.'
      : '🛡️ *Anti Delete Status → OFF*\nDeleted status protection disabled.'
    );
  },
};

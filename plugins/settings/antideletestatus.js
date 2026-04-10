// plugins/settings/antideletestatus.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'antideletestatus',
  desc: 'Send deleted statuses to your DM — .antideletestatus on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(val))
      return reply('Usage: .antideletestatus on\n       .antideletestatus off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.antideletestatus = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.antideletestatus
      ? '🛡️ *Anti Delete Status → ON*\n\n' +
        'How it works:\n' +
        '• When someone posts a status, it is silently cached\n' +
        '• If they DELETE it before the 24h expiry, you get it in your DM\n' +
        '• The DM shows their name and the original caption\n\n' +
        '⚠️ Only statuses received AFTER turning this ON are protected.'
      : '🛡️ *Anti Delete Status → OFF*\nDeleted status protection disabled.'
    );
  },
};

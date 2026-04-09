// plugins/settings/setwarn.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setwarn',
  desc: 'Set how many warnings before a member is kicked — .setwarn 3',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const n = parseInt(args[0]);
    if (isNaN(n) || n < 1 || n > 20)
      return reply('Usage: .setwarn <number>\nExample: .setwarn 3\nRange: 1 – 20');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.maxWarns = n;
    await dbSet(`settings:${userId}`, s);
    await reply(`⚠️ *Warn Limit Set*\n\nMembers will be kicked after *${n} warning(s)*.\nUse .warn @user in a group to warn someone.`);
  },
};

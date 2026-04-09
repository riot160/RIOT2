// plugins/settings/addcountrycode.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'addcountrycode',
  desc: 'Allow only specific country codes in group — .addcountrycode 254',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const code = (args[0] || '').replace(/[^0-9]/g, '');
    if (!code)
      return reply('Usage: .addcountrycode <code>\nExamples:\n.addcountrycode 254  (Kenya)\n.addcountrycode 1    (USA)\n.addcountrycode 44   (UK)');
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.allowedCodes || [];
    if (list.includes(code))
      return reply(`⚠️ Country code *+${code}* is already in the allowed list.`);
    list.push(code);
    s.allowedCodes = list;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Country Code Added*\n\n+${code} is now allowed.\nAllowed codes: ${list.map(c => '+' + c).join(', ')}`);
  },
};

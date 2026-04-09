// plugins/settings/delcountrycode.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'delcountrycode',
  desc: 'Remove a country code from the allowed list — .delcountrycode 254',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const code = (args[0] || '').replace(/[^0-9]/g, '');
    if (!code)
      return reply('Usage: .delcountrycode <code>\nExample: .delcountrycode 254');
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.allowedCodes || [];
    if (!list.includes(code))
      return reply(`❌ Country code *+${code}* is not in the allowed list.`);
    s.allowedCodes = list.filter(c => c !== code);
    await dbSet(`settings:${userId}`, s);
    await reply(`🗑️ *Country Code Removed*\n\n+${code} removed.\nRemaining: ${s.allowedCodes.length > 0 ? s.allowedCodes.map(c => '+' + c).join(', ') : 'None (all codes allowed)'}`);
  },
};

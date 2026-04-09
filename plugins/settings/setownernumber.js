// plugins/settings/setownernumber.js
import { config } from '../../config.js';
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setownernumber',
  desc: 'Change the owner number — .setownernumber 254700000000',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const num = (args[0] || '').replace(/[^0-9]/g, '');
    if (!num || num.length < 7)
      return reply('Usage: .setownernumber <number>\nExample: .setownernumber 254700000000\n(no + sign, include country code)');
    const old = config.OWNER_NUMBER;
    config.OWNER_NUMBER = num;
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.ownerNumber = num;
    await dbSet(`settings:${userId}`, s);
    await reply(
      `✅ *Owner Number Changed*\n\n` +
      `Old: ${old}\n` +
      `New: *${num}*\n\n` +
      `⚠️ Only this number can use owner commands now.`
    );
  },
};

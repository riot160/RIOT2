// plugins/settings/listcountrycode.js
import { dbGet } from '../../lib/database.js';

export default {
  command: 'listcountrycode',
  desc: 'List all allowed country codes',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.allowedCodes || [];
    if (!list.length)
      return reply('📋 *No country codes set.*\nAll numbers are currently allowed.\nUse .addcountrycode <code> to restrict.');
    await reply(
      `🌍 *Allowed Country Codes (${list.length})*\n` +
      `${'─'.repeat(28)}\n\n` +
      list.map((c, i) => `${i + 1}. +${c}`).join('\n') +
      `\n\n_Members with other codes can be auto-kicked._\n_Remove with .delcountrycode <code>_`
    );
  },
};

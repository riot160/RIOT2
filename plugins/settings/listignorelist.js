// plugins/settings/listignorelist.js
import { dbGet } from '../../lib/database.js';

export default {
  command: 'listignorelist',
  desc: 'List all numbers the bot is currently ignoring',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.ignoreList || [];
    if (!list.length)
      return reply('📋 *Ignore list is empty.*\nUse .addignorelist <number> to add someone.');
    const text = list.map((n, i) => `${i + 1}. +${n}`).join('\n');
    await reply(`🚫 *Ignored Numbers (${list.length})*\n${'─'.repeat(24)}\n\n${text}\n\n_Remove with .delignorelist <number>_`);
  },
};

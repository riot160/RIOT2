// plugins/settings/listsudo.js
import { dbGet } from '../../lib/database.js';

export default {
  command: 'listsudo',
  desc: 'List all users with sudo (sub-owner) access',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.sudoList || [];
    if (!list.length)
      return reply('📋 *No sudo users set.*\nUse .addsudo <number> to add one.');
    const text = list.map((n, i) => `${i + 1}. +${n}`).join('\n');
    await reply(`👑 *Sudo Users (${list.length})*\n${'─'.repeat(22)}\n\n${text}\n\n_Remove with .delsudo <number>_`);
  },
};

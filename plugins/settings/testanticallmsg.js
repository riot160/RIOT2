// plugins/settings/testanticallmsg.js
import { dbGet } from '../../lib/database.js';

export default {
  command: 'testanticallmsg',
  desc: 'Preview the anti-call message as callers will see it',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s   = (await dbGet(`settings:${userId}`)) || {};
    const msg = s.anticallMsg || '📵 Sorry, I cannot accept calls. Please send a text message.';
    await reply(`📞 *Anti-Call Message Preview:*\n\n${msg}`);
  },
};

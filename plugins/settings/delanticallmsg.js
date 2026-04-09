// plugins/settings/delanticallmsg.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'delanticallmsg',
  desc: 'Reset anti-call message back to default',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s = (await dbGet(`settings:${userId}`)) || {};
    delete s.anticallMsg;
    await dbSet(`settings:${userId}`, s);
    await reply('🗑️ *Anti-Call message reset to default.*\n\nDefault: _"📵 Sorry, I cannot accept calls. Please send a text message."_');
  },
};

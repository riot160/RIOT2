// plugins/settings/showanticallmsg.js
import { dbGet } from '../../lib/database.js';

export default {
  command: 'showanticallmsg',
  desc: 'Show the current anti-call rejection message',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s   = (await dbGet(`settings:${userId}`)) || {};
    const msg = s.anticallMsg || '📵 Sorry, I cannot accept calls. Please send a text message.';
    await reply(`📵 *Current Anti-Call Message:*\n\n_"${msg}"_\n\nChange it: .setanticallmsg <new message>`);
  },
};

// plugins/settings/anticall.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'anticall',
  desc: 'Automatically reject all incoming calls — .anticall on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .anticall on\n       .anticall off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.anticall = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.anticall
      ? '📵 *Anti Call → ON*\nAll incoming calls will be rejected automatically.\nUse .setanticallmsg to set the rejection message.'
      : '📵 *Anti Call → OFF*\nIncoming calls will be allowed through.'
    );
  },
};

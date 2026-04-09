// plugins/settings/alwaysonline.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'alwaysonline',
  desc: 'Keep the bot always appearing online — .alwaysonline on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, sock, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .alwaysonline on\n       .alwaysonline off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.alwaysonline = val === 'on';
    await dbSet(`settings:${userId}`, s);
    if (s.alwaysonline) {
      await sock.sendPresenceUpdate('available').catch(() => {});
    } else {
      await sock.sendPresenceUpdate('unavailable').catch(() => {});
    }
    await reply(s.alwaysonline
      ? '🟢 *Always Online → ON*\nBot will appear online 24/7.'
      : '🟢 *Always Online → OFF*\nNormal presence behaviour restored.'
    );
  },
};

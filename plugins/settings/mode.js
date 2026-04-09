// plugins/settings/mode.js
import { config } from '../../config.js';
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'mode',
  desc: 'Switch bot mode — .mode public  or  .mode private',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['public', 'private'].includes(val))
      return reply(
        'Usage: .mode public\n       .mode private\n\n' +
        '🌐 *public*  — anyone can use commands\n' +
        '🔒 *private* — only you (owner) can use commands'
      );
    config.MODE = val;
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.mode = val;
    await dbSet(`settings:${userId}`, s);
    await reply(val === 'public'
      ? '🌐 *Mode → PUBLIC*\nEveryone can now use bot commands.'
      : '🔒 *Mode → PRIVATE*\nOnly the owner can use bot commands now.'
    );
  },
};

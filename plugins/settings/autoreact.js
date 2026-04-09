// plugins/settings/autoreact.js
import { dbGet, dbSet } from '../../lib/database.js';

const DEFAULT_EMOJIS = ['❤️','🔥','👍','😂','🎉','💯','🙌','⚡'];

export default {
  command: 'autoreact',
  desc: 'Auto react to every incoming message — .autoreact on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .autoreact on\n       .autoreact off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autoreact = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.autoreact
      ? '💬 *Auto React → ON*\nBot will react to every incoming message with a random emoji.'
      : '💬 *Auto React → OFF*\nAuto-react disabled.'
    );
  },
};

// plugins/settings/autotype.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: ['autotype', 'autotyping', 'autorecordtyping'],
  desc: 'Show typing indicator before replying — .autotype on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .autotype on\n       .autotype off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autotyping = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.autotyping
      ? '⌨️ *Auto Type → ON*\nBot will show typing indicator before every reply.'
      : '⌨️ *Auto Type → OFF*\nTyping indicator disabled.'
    );
  },
};

// plugins/settings/chatbot.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'chatbot',
  desc: 'AI replies to every non-command message — .chatbot on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .chatbot on\n       .chatbot off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.chatbot = val === 'on';
    await dbSet(`settings:${userId}`, s);
    await reply(s.chatbot
      ? '🤖 *Chatbot → ON*\nBot will reply to all messages (not just commands) using AI.\nPowered by RIOT AI.'
      : '🤖 *Chatbot → OFF*\nBot will only respond to commands now.'
    );
  },
};

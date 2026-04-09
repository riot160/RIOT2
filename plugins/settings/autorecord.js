// plugins/settings/autorecord.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'autorecord',
  desc: 'Show recording status instead of typing — .autorecord on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, sock, jid, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .autorecord on\n       .autorecord off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autorecord = val === 'on';
    // if turning on, switch presence to recording; off → typing
    s.presenceType = val === 'on' ? 'recording' : 'composing';
    await dbSet(`settings:${userId}`, s);
    await reply(s.autorecord
      ? '🎙️ *Auto Record → ON*\nBot will show 🎙️ recording status before replies.'
      : '🎙️ *Auto Record → OFF*\nPresence reverts to normal typing indicator.'
    );
  },
};

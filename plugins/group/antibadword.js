// plugins/group/antibadword.js
import { getGroup, saveGroup, dbGet } from '../../lib/database.js';

export default {
  command: 'antibadword',
  desc: 'Toggle bad-word filter in group — .antibadword on/off',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ jid, userId, args, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .antibadword on\n       .antibadword off');
    const g = await getGroup(jid);
    g.antibadword = val === 'on';
    await saveGroup(jid, g);

    // Load the bad word list from settings
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.badwords || [];

    await reply(
      g.antibadword
        ? `🤬 *Anti Bad Word → ON*\n` +
          `Members who use banned words will be warned.\n` +
          `📋 Banned words: ${list.length > 0 ? list.join(', ') : 'None set — use .addbadword'}`
        : '🤬 *Anti Bad Word → OFF*\nBad-word filter disabled.'
    );
  },
};

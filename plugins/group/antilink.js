// plugins/group/antilink.js
import { getGroup, saveGroup } from '../../lib/database.js';

export default {
  command: 'antilink',
  desc: 'Toggle anti-link protection — .antilink on/off',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ jid, args, reply }) => {
    if (!['on', 'off'].includes(args[0]))
      return reply('Usage: .antilink on\n       .antilink off');
    const g = await getGroup(jid);
    g.antilink = args[0] === 'on';
    await saveGroup(jid, g);
    await reply(`🔗 Anti-link protection: *${g.antilink ? 'ON ✅' : 'OFF ❌'}*\n\n${g.antilink ? 'Members who send links will be removed.' : 'Links are now allowed.'}`);
  },
};

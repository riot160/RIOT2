// plugins/group/welcome.js
import { getGroup, saveGroup } from '../../lib/database.js';

export default {
  command: 'welcome',
  desc: 'Toggle welcome messages — .welcome on/off  or  .welcome set <message>',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ jid, args, text, reply }) => {
    const g = await getGroup(jid);

    if (args[0] === 'on' || args[0] === 'off') {
      g.welcome = args[0] === 'on';
      await saveGroup(jid, g);
      return reply(`👋 Welcome messages: *${g.welcome ? 'ON ✅' : 'OFF ❌'}*`);
    }

    if (args[0] === 'set') {
      const msg = args.slice(1).join(' ');
      if (!msg) return reply('Usage: .welcome set <message>\nUse @user to mention the new member.');
      g.welcomeMsg = msg;
      await saveGroup(jid, g);
      return reply(`✅ Welcome message updated:\n\n_${msg}_`);
    }

    // show current status
    await reply(
`👋 *Welcome Settings*

Status  : ${g.welcome ? 'ON ✅' : 'OFF ❌'}
Message : _${g.welcomeMsg || 'Welcome, @user!'}_

Commands:
• .welcome on
• .welcome off
• .welcome set Welcome to the group @user! 🎉`
    );
  },
};

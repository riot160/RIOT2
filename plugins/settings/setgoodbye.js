// plugins/settings/setgoodbye.js
import { getGroup, saveGroup } from '../../lib/database.js';

export default {
  command: 'setgoodbye',
  desc: 'Set the group goodbye message — .setgoodbye Goodbye @user!',
  category: 'settings',
  owner: true,
  run: async ({ text, jid, isGroup, reply }) => {
    if (!isGroup) return reply('❌ Use this command inside a group.');
    if (!text)
      return reply(
        'Usage: .setgoodbye <message>\n\n' +
        'Variables:\n' +
        '• @user  — the member who left\n' +
        '• @group — group name\n' +
        '• @count — remaining member count\n\n' +
        'Example: .setgoodbye Goodbye @user! We will miss you 😢'
      );
    const g = await getGroup(jid);
    g.goodbyeMsg = text;
    g.goodbye    = true;
    await saveGroup(jid, g);
    await reply(`✅ *Goodbye Message Set*\n\n_${text}_\n\nGoodbye messages are now ON.`);
  },
};

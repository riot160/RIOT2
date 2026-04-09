// plugins/settings/setwelcome.js
import { getGroup, saveGroup } from '../../lib/database.js';

export default {
  command: 'setwelcome',
  desc: 'Set the group welcome message — .setwelcome Welcome @user to @group!',
  category: 'settings',
  owner: true,
  run: async ({ text, jid, isGroup, reply }) => {
    if (!isGroup)
      return reply('❌ Use this command inside a group.');
    if (!text)
      return reply(
        'Usage: .setwelcome <message>\n\n' +
        'Variables you can use:\n' +
        '• @user  — mentions the new member\n' +
        '• @group — group name\n' +
        '• @count — total member count\n\n' +
        'Example:\n.setwelcome Welcome @user to @group! 🎉 We now have @count members.'
      );
    const g = await getGroup(jid);
    g.welcomeMsg = text;
    g.welcome    = true;
    await saveGroup(jid, g);
    await reply(
      `✅ *Welcome Message Set*\n\n` +
      `_${text}_\n\n` +
      `Welcome messages are now ON for this group.`
    );
  },
};

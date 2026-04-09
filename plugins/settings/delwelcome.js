// plugins/settings/delwelcome.js
import { getGroup, saveGroup } from '../../lib/database.js';

export default {
  command: 'delwelcome',
  desc: 'Reset the welcome message back to default',
  category: 'settings',
  owner: true,
  run: async ({ jid, isGroup, reply }) => {
    if (!isGroup) return reply('❌ Use this command inside a group.');
    const g = await getGroup(jid);
    g.welcomeMsg = 'Welcome to the group, @user! 🎉';
    g.welcome    = false;
    await saveGroup(jid, g);
    await reply('🗑️ *Welcome message reset to default and turned OFF.*\nUse .setwelcome to set a new one.');
  },
};

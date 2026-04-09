// plugins/settings/delgoodbye.js
import { getGroup, saveGroup } from '../../lib/database.js';

export default {
  command: 'delgoodbye',
  desc: 'Reset the goodbye message back to default',
  category: 'settings',
  owner: true,
  run: async ({ jid, isGroup, reply }) => {
    if (!isGroup) return reply('❌ Use this command inside a group.');
    const g = await getGroup(jid);
    g.goodbyeMsg = 'Goodbye @user! 👋';
    g.goodbye    = false;
    await saveGroup(jid, g);
    await reply('🗑️ *Goodbye message reset to default and turned OFF.*\nUse .setgoodbye to set a new one.');
  },
};

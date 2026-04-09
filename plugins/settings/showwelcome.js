// plugins/settings/showwelcome.js
import { getGroup } from '../../lib/database.js';

export default {
  command: 'showwelcome',
  desc: 'Preview the current welcome message for this group',
  category: 'settings',
  owner: true,
  run: async ({ jid, isGroup, sock, reply }) => {
    if (!isGroup) return reply('❌ Use this command inside a group.');
    const g    = await getGroup(jid);
    const meta = await sock.groupMetadata(jid).catch(() => ({ subject: 'Group', participants: [] }));
    const msg  = (g.welcomeMsg || 'Welcome, @user! 🎉')
      .replace('@group', meta.subject)
      .replace('@count', meta.participants.length);
    await reply(
      `👋 *Welcome Message Preview*\n\n` +
      `Status : ${g.welcome ? '✅ ON' : '❌ OFF'}\n\n` +
      `${msg}\n\n` +
      `_(@user will be replaced with the new member's tag)_`
    );
  },
};

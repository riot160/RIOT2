// plugins/settings/testwelcome.js
import { getGroup } from '../../lib/database.js';

export default {
  command: 'testwelcome',
  desc: 'Send a test welcome message to see how it looks',
  category: 'settings',
  owner: true,
  run: async ({ jid, isGroup, sock, senderNumber, sender, reply }) => {
    if (!isGroup) return reply('❌ Use this command inside a group.');
    const g    = await getGroup(jid);
    const meta = await sock.groupMetadata(jid).catch(() => ({ subject: 'Group', participants: [] }));
    const msg  = (g.welcomeMsg || 'Welcome to the group, @user! 🎉')
      .replace('@group', meta.subject)
      .replace('@count', meta.participants.length)
      .replace('@user',  `@${senderNumber}`);
    await sock.sendMessage(jid, {
      text:     `👋 *[TEST WELCOME]*\n\n${msg}`,
      mentions: [sender],
    });
  },
};

// plugins/settings/testgoodbye.js
import { getGroup } from '../../lib/database.js';

export default {
  command: 'testgoodbye',
  desc: 'Send a test goodbye message to see how it looks',
  category: 'settings',
  owner: true,
  run: async ({ jid, isGroup, sock, sender, senderNumber, reply }) => {
    if (!isGroup) return reply('❌ Use this command inside a group.');
    const g    = await getGroup(jid);
    const meta = await sock.groupMetadata(jid).catch(() => ({ subject: 'Group', participants: [] }));
    const msg  = (g.goodbyeMsg || 'Goodbye @user! 👋')
      .replace('@group', meta.subject)
      .replace('@count', meta.participants.length)
      .replace('@user',  `@${senderNumber}`);
    await sock.sendMessage(jid, {
      text:     `👋 *[TEST GOODBYE]*\n\n${msg}`,
      mentions: [sender],
    });
  },
};

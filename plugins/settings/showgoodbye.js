// plugins/settings/showgoodbye.js
import { getGroup } from '../../lib/database.js';

export default {
  command: 'showgoodbye',
  desc: 'Preview the current goodbye message for this group',
  category: 'settings',
  owner: true,
  run: async ({ jid, isGroup, sock, reply }) => {
    if (!isGroup) return reply('❌ Use this command inside a group.');
    const g    = await getGroup(jid);
    const meta = await sock.groupMetadata(jid).catch(() => ({ subject: 'Group', participants: [] }));
    const msg  = (g.goodbyeMsg || 'Goodbye @user! 👋')
      .replace('@group', meta.subject)
      .replace('@count', meta.participants.length);
    await reply(
      `👋 *Goodbye Message Preview*\n\n` +
      `Status : ${g.goodbye ? '✅ ON' : '❌ OFF'}\n\n` +
      `${msg}\n\n` +
      `_(@user will be replaced with the leaving member's tag)_`
    );
  },
};

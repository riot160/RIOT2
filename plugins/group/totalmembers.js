// plugins/group/totalmembers.js
export default {
  command: ['totalmembers', 'members', 'membercount'],
  desc: 'Show total group member count with breakdown',
  category: 'group',
  group: true,
  run: async ({ sock, jid, reply }) => {
    const meta   = await sock.groupMetadata(jid);
    const all    = meta.participants;
    const admins = all.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
    const supers = all.filter(p => p.admin === 'superadmin');
    const normal = all.filter(p => !p.admin);
    await reply(
      `👥 *Group Members*\n\n` +
      `📌 Group  : ${meta.subject}\n` +
      `${'─'.repeat(26)}\n` +
      `👑 Creator  : ${supers.length}\n` +
      `🛡️  Admins   : ${admins.length}\n` +
      `🙋 Members  : ${normal.length}\n` +
      `${'─'.repeat(26)}\n` +
      `📊 Total    : *${all.length}*`
    );
  },
};

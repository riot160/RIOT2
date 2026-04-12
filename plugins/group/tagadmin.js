// plugins/group/tagadmin.js
export default {
  command: ['tagadmin', 'mentionadmin', 'calladmin'],
  desc: 'Tag all group admins — .tagadmin <optional message>',
  category: 'group',
  group: true,
  run: async ({ sock, jid, text }) => {
    const meta   = await sock.groupMetadata(jid);
    const admins = meta.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    if (!admins.length) {
      await sock.sendMessage(jid, { text: '❌ No admins found in this group.' });
      return;
    }
    const tags = admins.map(j => `@${j.split('@')[0]}`).join(' ');
    const msg  = text ? `📢 *${text}*\n\n${tags}` : `📢 ${tags}`;
    await sock.sendMessage(jid, { text: msg, mentions: admins });
  },
};

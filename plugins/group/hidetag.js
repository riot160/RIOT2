// plugins/group/hidetag.js
export default {
  command: ['hidetag', 'stag'],
  desc: 'Tag all members silently (hidden mentions)',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, text, reply }) => {
    const meta    = await sock.groupMetadata(jid);
    const members = meta.participants.map(p => p.id);
    await sock.sendMessage(jid, {
      text:     text || '📢',
      mentions: members,
    });
  },
};

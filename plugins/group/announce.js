// plugins/group/announce.js
export default {
  command: ['announce', 'announcement'],
  desc: 'Post a styled announcement — .announce <message>',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, text, reply }) => {
    if (!text) return reply('Usage: .announce <your announcement>\nExample: .announce Meeting today at 8PM!');
    const meta = await sock.groupMetadata(jid).catch(() => ({ subject: 'Group' }));
    await sock.sendMessage(jid, {
      text:
        `📢 *ANNOUNCEMENT*\n` +
        `${'═'.repeat(24)}\n\n` +
        `${text}\n\n` +
        `${'═'.repeat(24)}\n` +
        `📌 ${meta.subject}`,
    });
  },
};

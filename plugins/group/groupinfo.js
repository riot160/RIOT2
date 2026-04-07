// plugins/group/groupinfo.js
export default {
  command: ['groupinfo', 'ginfo', 'gcinfo'],
  desc: 'Show detailed group information',
  category: 'group',
  group: true,
  run: async ({ sock, jid, reply }) => {
    const meta    = await sock.groupMetadata(jid);
    const total   = meta.participants.length;
    const admins  = meta.participants.filter(p => p.admin).length;
    const created = new Date(meta.creation * 1000).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    await reply(
`\`\`\`
📋 GROUP INFORMATION
${'─'.repeat(28)}
📌 Name     : ${meta.subject}
🆔 JID      : ${jid}
👥 Members  : ${total}
👑 Admins   : ${admins}
🙋 Members  : ${total - admins}
📅 Created  : ${created}
🔒 Restrict : ${meta.restrict ? 'Yes' : 'No'}
📣 Announce : ${meta.announce ? 'Yes' : 'No'}
\`\`\``
    );
  },
};

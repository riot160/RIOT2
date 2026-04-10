// plugins/owner/groupid.js
export default {
  command: ['groupid', 'gid'],
  desc: 'Get the current group ID (JID) — useful for configs',
  category: 'owner',
  owner: true,
  group: true,
  run: async ({ jid, sock, reply }) => {
    const meta = await sock.groupMetadata(jid).catch(() => null);
    await reply(
      `🆔 *Group ID*\n\n` +
      `📌 Name : ${meta?.subject || 'Unknown'}\n` +
      `🔗 JID  : ${jid}\n` +
      `👥 Size : ${meta?.participants?.length || '?'} members`
    );
  },
};

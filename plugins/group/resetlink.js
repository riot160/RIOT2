// plugins/group/resetlink.js
export default {
  command: ['resetlink', 'revokelink', 'newlink'],
  desc: 'Reset/revoke the current group invite link',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, reply }) => {
    try {
      await sock.groupRevokeInvite(jid);
      const newCode = await sock.groupInviteCode(jid);
      await reply(
        `🔄 *Invite link reset!*\n\n` +
        `🔗 New link:\nhttps://chat.whatsapp.com/${newCode}\n\n` +
        `_Old link is now invalid._`
      );
    } catch (e) {
      await reply('❌ Failed to reset link: ' + e.message);
    }
  },
};

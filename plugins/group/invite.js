// plugins/group/invite.js
export default {
  command: ['invite', 'link'],
  desc: 'Get the group invite link',
  category: 'group',
  group: true,
  run: async ({ sock, jid, reply }) => {
    try {
      const code = await sock.groupInviteCode(jid);
      await reply(`🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}\n\n_Share to invite people_`);
    } catch {
      await reply('❌ Could not get invite link. Make sure I am an admin.');
    }
  },
};

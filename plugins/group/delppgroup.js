// plugins/group/delppgroup.js
export default {
  command: ['delppgroup', 'removegrouppp'],
  desc: 'Remove the group profile picture — .delppgroup',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, reply }) => {
    try {
      await sock.removeProfilePicture(jid);
      await reply('✅ *Group profile picture removed!*');
    } catch (e) {
      await reply('❌ Failed to remove group picture: ' + e.message);
    }
  },
};

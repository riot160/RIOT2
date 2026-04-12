// plugins/group/getgrouppp.js
export default {
  command: ['getgrouppp', 'grouppic', 'groupphoto'],
  desc: 'Get the current group profile picture',
  category: 'group',
  group: true,
  run: async ({ sock, jid, msg, reply }) => {
    try {
      const url = await sock.profilePictureUrl(jid, 'image');
      await sock.sendMessage(jid,
        { image: { url }, caption: '🖼️ *Group Profile Picture*' },
        { quoted: msg }
      );
    } catch {
      await reply('❌ This group has no profile picture set.');
    }
  },
};

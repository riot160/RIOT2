// plugins/group/setgroupname.js
export default {
  command: ['setgroupname', 'groupname', 'rename'],
  desc: 'Change the group name — .setgroupname New Name',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, text, reply }) => {
    if (!text) return reply('Usage: .setgroupname <new name>\nExample: .setgroupname RIOT MD Squad');
    try {
      await sock.groupUpdateSubject(jid, text);
      await reply(`✅ *Group name changed to:*\n_${text}_`);
    } catch (e) {
      await reply('❌ Failed to change group name: ' + e.message);
    }
  },
};

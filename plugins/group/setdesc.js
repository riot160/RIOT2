// plugins/group/setdesc.js
export default {
  command: ['setdesc', 'setgroupdesc', 'groupdesc'],
  desc: 'Change the group description — .setdesc <text>',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, text, reply }) => {
    if (!text) return reply('Usage: .setdesc <description>\nExample: .setdesc Welcome to RIOT MD official group!');
    try {
      await sock.groupUpdateDescription(jid, text);
      await reply(`✅ *Group description updated:*\n\n_${text}_`);
    } catch (e) {
      await reply('❌ Failed to update description: ' + e.message);
    }
  },
};

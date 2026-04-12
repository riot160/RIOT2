// plugins/group/open.js
export default {
  command: ['open', 'opengroup'],
  desc: 'Open the group — all members can send messages',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, reply }) => {
    await sock.groupSettingUpdate(jid, 'not_announcement');
    await reply('🔓 *Group is now OPEN*\nEveryone can send messages.');
  },
};

// plugins/group/close.js
export default {
  command: ['close', 'closegroup'],
  desc: 'Close the group — only admins can send messages',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, reply }) => {
    await sock.groupSettingUpdate(jid, 'announcement');
    await reply('🔒 *Group is now CLOSED*\nOnly admins can send messages.');
  },
};

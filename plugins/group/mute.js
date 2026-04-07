// plugins/group/mute.js
export default {
  command: 'mute',
  desc: 'Mute group — only admins can send messages',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, reply }) => {
    await sock.groupSettingUpdate(jid, 'announcement');
    await reply('🔇 *Group muted*\nOnly admins can send messages now.');
  },
};

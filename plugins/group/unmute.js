// plugins/group/unmute.js
export default {
  command: 'unmute',
  desc: 'Unmute group — everyone can send messages',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, reply }) => {
    await sock.groupSettingUpdate(jid, 'not_announcement');
    await reply('🔊 *Group unmuted*\nEveryone can send messages now.');
  },
};

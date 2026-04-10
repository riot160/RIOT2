// plugins/owner/leave.js
export default {
  command: 'leave',
  desc: 'Leave the current group — .leave',
  category: 'owner',
  owner: true,
  group: true,
  run: async ({ sock, jid, reply }) => {
    await reply('👋 *Leaving this group…*\nGoodbye everyone!');
    await new Promise(r => setTimeout(r, 1500));
    try {
      await sock.groupLeave(jid);
    } catch (e) {
      await reply('❌ Could not leave: ' + e.message);
    }
  },
};

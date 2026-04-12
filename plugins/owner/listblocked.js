// plugins/owner/listblocked.js
export default {
  command: ['listblocked', 'blocked'],
  desc: 'List all blocked contacts',
  category: 'owner',
  owner: true,
  run: async ({ sock, reply }) => {
    try {
      const list = await sock.fetchBlocklist();
      if (!list?.length) return reply('📋 *No blocked contacts.*');
      let text = `🚫 *Blocked Contacts (${list.length})*\n${'─'.repeat(24)}\n\n`;
      list.forEach((jid, i) => {
        const num = jid.split('@')[0];
        text += `${i + 1}. +${num}\n`;
      });
      text += `\n_Use .unblock <number> to unblock_`;
      await reply(text);
    } catch (e) {
      await reply('❌ Could not fetch blocked list: ' + e.message);
    }
  },
};

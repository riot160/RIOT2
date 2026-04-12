// plugins/owner/unblockall.js
export default {
  command: 'unblockall',
  desc: 'Unblock all currently blocked contacts',
  category: 'owner',
  owner: true,
  run: async ({ sock, reply }) => {
    try {
      const list = await sock.fetchBlocklist();
      if (!list?.length) return reply('✅ No blocked contacts to unblock.');
      await reply(`🔓 Unblocking *${list.length}* contact(s)…`);
      let done = 0;
      for (const jid of list) {
        await sock.updateBlockStatus(jid, 'unblock').catch(() => {});
        done++;
        await new Promise(r => setTimeout(r, 500));
      }
      await reply(`✅ *Unblocked ${done} contact(s) successfully!*`);
    } catch (e) {
      await reply('❌ Failed: ' + e.message);
    }
  },
};

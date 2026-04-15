// plugins/fun/countdown2.js
export default {
  command: 'countdown2',
  desc: 'Send a live countdown in chat — .countdown2 5',
  category: 'fun',
  run: async ({ args, sock, jid, reply }) => {
    const n = parseInt(args[0]);
    if (isNaN(n) || n < 1 || n > 10)
      return reply('Usage: .countdown2 <1-10>\nExample: .countdown2 5');
    await reply(`🚀 Starting countdown from *${n}*!`);
    for (let i = n; i >= 1; i--) {
      await new Promise(r => setTimeout(r, 1200));
      await sock.sendMessage(jid, { text: `${i}️⃣` });
    }
    await new Promise(r => setTimeout(r, 1200));
    await sock.sendMessage(jid, { text: '🎉 *BOOM!* 🎉' });
  },
};

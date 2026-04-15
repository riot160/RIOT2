// plugins/fun/toss.js
export default {
  command: ['toss', 'coinflip', 'heads'],
  desc: 'Flip a coin with animation — .toss',
  category: 'fun',
  run: async ({ sock, jid, reply }) => {
    await sock.sendMessage(jid, { text: '🪙 Tossing…' });
    await new Promise(r => setTimeout(r, 1000));
    await sock.sendMessage(jid, { text: '🌀 Spinning…' });
    await new Promise(r => setTimeout(r, 1000));
    const result = Math.random() > 0.5;
    await sock.sendMessage(jid, {
      text: result
        ? '🟡 *HEADS!* 👑'
        : '⚪ *TAILS!* 🦅'
    });
  },
};

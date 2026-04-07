// plugins/fun/flip.js
export default {
  command: ['flip', 'coin'],
  desc: 'Flip a coin — heads or tails',
  category: 'fun',
  run: async ({ reply }) => {
    const result = Math.random() > 0.5 ? '✅ *Heads*' : '❌ *Tails*';
    await reply(`🪙 *Coin Flip*\n\n${result}`);
  },
};

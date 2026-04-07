// plugins/fun/roll.js
export default {
  command: ['roll', 'dice'],
  desc: 'Roll a dice — .roll 6  (or any number of sides)',
  category: 'fun',
  run: async ({ args, reply }) => {
    const sides  = parseInt(args[0]) || 6;
    if (sides < 2) return reply('Dice must have at least 2 sides.');
    const result = Math.floor(Math.random() * sides) + 1;
    await reply(`🎲 *Dice Roll* (${sides} sides)\n\nYou rolled: *${result}*`);
  },
};

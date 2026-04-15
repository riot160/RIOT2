// plugins/tools/dice2.js
export default {
  command: ['dice2', 'rolldice', 'dnd'],
  desc: 'Roll dice like D&D — .dice2 2d6  .dice2 1d20',
  category: 'tools',
  run: async ({ args, reply }) => {
    const input = args[0] || '1d6';
    const match = input.match(/^(\d+)d(\d+)$/i);
    if (!match) return reply('Usage: .dice2 <NdS>\nExamples: .dice2 2d6  .dice2 1d20  .dice2 3d8');
    const count = Math.min(parseInt(match[1]), 20);
    const sides = Math.min(parseInt(match[2]), 100);
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);
    await reply(
      `🎲 *Dice Roll: ${count}d${sides}*\n\n` +
      `Rolls : ${rolls.join(', ')}\n` +
      `Total : *${total}*\n` +
      `Avg   : ${(total / count).toFixed(1)}`
    );
  },
};

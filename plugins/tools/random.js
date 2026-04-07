// plugins/tools/random.js
export default {
  command: ['random', 'rand'],
  desc: 'Generate a random number — .random  or  .random 1 100',
  category: 'tools',
  run: async ({ args, reply }) => {
    const min = parseInt(args[0] ?? 1);
    const max = parseInt(args[1] ?? 100);
    if (isNaN(min) || isNaN(max)) return reply('Usage: .random <min> <max>\nExample: .random 1 1000');
    if (min >= max) return reply('❌ Min must be less than max.');
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    await reply(`🎲 *Random Number*\n\nRange : ${min} — ${max}\nResult: *${result}*`);
  },
};

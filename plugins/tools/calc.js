// plugins/tools/calc.js
export default {
  command: ['calc', 'math'],
  desc: 'Evaluate a math expression — .calc 2 + 2 * 10',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .calc <expression>\nExample: .calc (5 + 3) * 2');
    try {
      const safe   = text.replace(/[^0-9+\-*/.() %^]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${safe})`)();
      if (!isFinite(result)) throw new Error('Result is not a finite number');
      await reply(`🧮 *Calculator*\n\n${safe} = *${result}*`);
    } catch {
      await reply('❌ Invalid expression.\nExample: .calc 100 / 4 + 5');
    }
  },
};

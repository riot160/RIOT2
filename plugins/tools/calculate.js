// plugins/tools/calculate.js
export default {
  command: ['calculate', 'cal'],
  desc: 'Evaluate a math expression — .calculate (5+3)*2/4^2',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text)
      return reply(
        '🧮 Usage: .calculate <expression>\n\n' +
        'Examples:\n' +
        '• .calculate 2 + 2\n' +
        '• .calculate (10 * 5) / 2\n' +
        '• .calculate 2^10\n' +
        '• .calculate sqrt(144)\n' +
        '• .calculate pi * 5^2'
      );
    try {
      // Safe expression evaluator — supports ^, sqrt, pi, e
      let expr = text
        .replace(/\^/g, '**')
        .replace(/sqrt\(([^)]+)\)/g, (_, n) => `Math.sqrt(${n})`)
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\be\b/g,  'Math.E')
        .replace(/[^0-9+\-*/.() %Math.PISQRTEI]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();
      if (!isFinite(result)) throw new Error('Result is not a finite number');
      await reply(
        `🧮 *Calculator*\n\n` +
        `📥 Input  : ${text}\n` +
        `📤 Result : *${result}*`
      );
    } catch {
      await reply('❌ Invalid expression.\nExample: .calculate (5+3) * 2');
    }
  },
};

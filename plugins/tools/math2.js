// plugins/tools/math2.js
export default {
  command: ['math2', 'solve', 'equation'],
  desc: 'Solve math expressions including sqrt, log, sin, cos — .math2 sqrt(144)+log(100)',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .math2 <expression>\nSupports: sqrt, log, sin, cos, tan, abs, PI, E\nExample: .math2 sqrt(144) + log(100)');
    try {
      const expr = text
        .replace(/\^/g, '**')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\blog\b/g, 'Math.log10')
        .replace(/\bln\b/g,  'Math.log')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bPI\b/g,  'Math.PI')
        .replace(/\bE\b/g,   'Math.E')
        .replace(/[^0-9+\-*/.() %MathsqrtlogsincoabPIE]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();
      if (!isFinite(result)) throw new Error('Result is not a finite number');
      await reply(`🧮 *Math Solver*\n\n📥 Input  : ${text}\n📤 Result : *${result}*`);
    } catch {
      await reply('❌ Invalid expression.\nExample: .math2 sqrt(16) * 3 + log(1000)');
    }
  },
};

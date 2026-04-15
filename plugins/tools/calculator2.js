// plugins/tools/calculator2.js
const memory = new Map(); // jid → running total
export default {
  command: ['calculator2', 'calc2'],
  desc: 'Persistent calculator — .calc2 100  then .calc2 +50  .calc2 *2  .calc2 clear',
  category: 'tools',
  run: async ({ jid, args, reply }) => {
    const input   = args[0];
    const current = memory.get(jid) || 0;
    if (!input || input === 'clear') {
      memory.delete(jid);
      return reply(`🧮 *Calculator cleared*\nValue reset to 0\n\nUsage:\n.calc2 100   → set to 100\n.calc2 +50   → add 50\n.calc2 *2    → multiply by 2\n.calc2 -30   → subtract 30\n.calc2 /4    → divide by 4\n.calc2 clear → reset`);
    }
    if (input === 'result' || input === '=') {
      return reply(`🧮 *Result: ${current}*`);
    }
    let newVal = current;
    try {
      const op  = input[0];
      const num = parseFloat(input.slice(1) || input);
      if (['+','-','*','/'].includes(op) && !isNaN(num)) {
        if (op === '+') newVal = current + num;
        if (op === '-') newVal = current - num;
        if (op === '*') newVal = current * num;
        if (op === '/') { if (num === 0) return reply('❌ Cannot divide by zero'); newVal = current / num; }
      } else if (!isNaN(parseFloat(input))) {
        newVal = parseFloat(input);
      } else {
        return reply('❌ Invalid input. Use: .calc2 +50  .calc2 *2  .calc2 clear');
      }
    } catch { return reply('❌ Invalid input.'); }
    memory.set(jid, newVal);
    await reply(`🧮 *Calculator*\n\n${current} ${input} = *${newVal}*\n\n_Continue with .calc2 +N, -N, *N, /N_`);
  },
};

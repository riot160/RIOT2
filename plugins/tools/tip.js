// plugins/tools/tip.js
export default {
  command: ['tip', 'tipcalc', 'splitbill'],
  desc: 'Calculate tip and split bill — .tip 2500 15 4  (bill tip% people)',
  category: 'tools',
  run: async ({ args, reply }) => {
    const bill    = parseFloat(args[0]);
    const tipPct  = parseFloat(args[1]) || 10;
    const people  = parseInt(args[2]) || 1;
    if (isNaN(bill)) return reply('Usage: .tip <bill> <tip%> <people>\nExample: .tip 2500 15 4\n.tip 500 10 2');
    const tipAmt  = (bill * tipPct) / 100;
    const total   = bill + tipAmt;
    const perHead = total / people;
    await reply(
      `🍽️ *Bill Calculator*\n\n` +
      `💵 Bill    : ${bill.toLocaleString()}\n` +
      `💰 Tip     : ${tipPct}% = ${tipAmt.toFixed(2)}\n` +
      `${'─'.repeat(24)}\n` +
      `🧾 Total   : *${total.toFixed(2)}*\n` +
      `👤 Per person (${people}): *${perHead.toFixed(2)}*`
    );
  },
};

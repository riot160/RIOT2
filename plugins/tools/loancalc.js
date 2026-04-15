// plugins/tools/loancalc.js
export default {
  command: ['loancalc', 'loan', 'emi'],
  desc: 'Calculate loan monthly payment — .loancalc 50000 10 12  (amount rate months)',
  category: 'tools',
  run: async ({ args, reply }) => {
    const principal = parseFloat(args[0]);
    const rate      = parseFloat(args[1]);
    const months    = parseInt(args[2]);
    if (isNaN(principal) || isNaN(rate) || isNaN(months))
      return reply(
        'Usage: .loancalc <amount> <annual_rate%> <months>\n\n' +
        'Example: .loancalc 100000 12 24\n' +
        '(100,000 loan at 12% per year for 24 months)'
      );
    const r         = rate / 100 / 12; // monthly rate
    const emi       = r === 0
      ? principal / months
      : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const total     = emi * months;
    const interest  = total - principal;
    await reply(
      `🏦 *Loan Calculator*\n\n` +
      `💰 Principal  : ${principal.toLocaleString()}\n` +
      `📊 Rate       : ${rate}% per year\n` +
      `📅 Duration   : ${months} months\n` +
      `${'─'.repeat(26)}\n` +
      `💳 Monthly EMI : *${emi.toFixed(2)}*\n` +
      `💵 Total Paid  : ${total.toFixed(2)}\n` +
      `📈 Interest    : ${interest.toFixed(2)}`
    );
  },
};

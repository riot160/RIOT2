// plugins/tools/currency.js
import fetch from 'node-fetch';

export default {
  command: ['currency', 'convert', 'fx'],
  desc: 'Convert currency — .currency 100 USD KES',
  category: 'tools',
  run: async ({ args, reply }) => {
    const [amount, from, to] = args;
    if (!amount || !from || !to)
      return reply('Usage: .currency <amount> <FROM> <TO>\nExample: .currency 100 USD KES');
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${from.toUpperCase()}&to=${to.toUpperCase()}`
      );
      const d      = await res.json();
      const result = d.rates?.[to.toUpperCase()];
      if (!result) return reply('❌ Invalid currency pair.\nExample codes: USD KES EUR GBP JPY');
      await reply(
`💱 *Currency Converter*

${amount} ${from.toUpperCase()} = *${result.toFixed(2)} ${to.toUpperCase()}*`
      );
    } catch {
      await reply('❌ Currency conversion failed. Try again.');
    }
  },
};

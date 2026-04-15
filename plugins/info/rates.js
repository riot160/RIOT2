// plugins/info/rates.js
import fetch from 'node-fetch';
export default {
  command: ['rates', 'exchangerates', 'forex'],
  desc: 'Get live exchange rates — .rates KES  or  .rates USD',
  category: 'info',
  run: async ({ args, reply }) => {
    const base = (args[0] || 'USD').toUpperCase();
    const targets = ['USD','EUR','GBP','KES','NGN','ZAR','GHS','UGX','TZS','AED','JPY','CNY'];
    try {
      const res  = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
      const d    = await res.json();
      if (d.error) return reply(`❌ Currency *${base}* not found.\nExample codes: USD, KES, EUR, GBP, NGN`);
      let text = `💱 *Exchange Rates*\nBase: *${base}*\n${'─'.repeat(26)}\n\n`;
      targets.filter(t => t !== base).forEach(t => {
        const rate = d.rates[t];
        if (rate) text += `${t.padEnd(5)} : ${rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}\n`;
      });
      text += `\n_Updated: ${d.date}_`;
      await reply(text);
    } catch (e) { await reply('❌ Exchange rates unavailable: ' + e.message); }
  },
};

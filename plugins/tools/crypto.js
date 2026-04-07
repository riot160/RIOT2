// plugins/tools/crypto.js
import fetch from 'node-fetch';

export default {
  command: ['crypto', 'coin', 'price'],
  desc: 'Get crypto price — .crypto bitcoin',
  category: 'tools',
  run: async ({ args, reply }) => {
    const coin = args[0]?.toLowerCase() || 'bitcoin';
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd,kes&include_24hr_change=true`
      );
      const d = await res.json();
      const c = d[coin];
      if (!c) return reply(`❌ Coin not found: *${coin}*\nTry: bitcoin, ethereum, solana`);
      const change = c.usd_24h_change?.toFixed(2);
      const arrow  = change >= 0 ? '📈' : '📉';
      await reply(
`💰 *${coin.toUpperCase()}*

💵 USD  : $${c.usd?.toLocaleString()}
🇰🇪 KES  : KSh ${c.kes?.toLocaleString()}
${arrow} 24h : ${change}%`
      );
    } catch {
      await reply('❌ Crypto price fetch failed. Try again.');
    }
  },
};

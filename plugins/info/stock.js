// plugins/info/stock.js
import fetch from 'node-fetch';
export default {
  command: ['stock', 'stocks', 'stonks'],
  desc: 'Get stock price — .stock AAPL  .stock TSLA  .stock AMZN',
  category: 'info',
  run: async ({ args, reply }) => {
    const symbol = (args[0] || '').toUpperCase();
    if (!symbol) return reply('Usage: .stock <symbol>\nExamples:\n.stock AAPL (Apple)\n.stock TSLA (Tesla)\n.stock AMZN (Amazon)\n.stock GOOGL (Google)');
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const d    = await res.json();
      const meta = d.chart?.result?.[0]?.meta;
      if (!meta) return reply(`❌ Stock *${symbol}* not found.`);
      const price  = meta.regularMarketPrice;
      const prev   = meta.chartPreviousClose;
      const change = ((price - prev) / prev * 100).toFixed(2);
      const arrow  = change >= 0 ? '📈' : '📉';
      await reply(
        `${arrow} *${symbol} — ${meta.shortName || meta.symbol}*\n` +
        `${'─'.repeat(28)}\n` +
        `💵 Price    : $${price?.toFixed(2)}\n` +
        `📊 Change   : ${change >= 0 ? '+' : ''}${change}%\n` +
        `📅 Prev     : $${prev?.toFixed(2)}\n` +
        `📈 High     : $${meta.regularMarketDayHigh?.toFixed(2)}\n` +
        `📉 Low      : $${meta.regularMarketDayLow?.toFixed(2)}\n` +
        `🏪 Exchange : ${meta.exchangeName}`
      );
    } catch (e) { await reply('❌ Stock lookup failed: ' + e.message); }
  },
};

// plugins/tools/country.js
import fetch from 'node-fetch';
export default {
  command: ['country', 'countryinfo'],
  desc: 'Get country information — .country Kenya',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .country <country name>\nExample: .country Kenya');
    try {
      const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(text)}?fullText=false`);
      const d   = await res.json();
      if (d.status === 404 || !d.length) return reply(`❌ Country *${text}* not found.`);
      const c       = d[0];
      const capital = c.capital?.[0] || '—';
      const region  = c.region || '—';
      const pop     = c.population?.toLocaleString() || '—';
      const langs   = Object.values(c.languages || {}).join(', ') || '—';
      const curr    = Object.values(c.currencies || {}).map(cu => `${cu.name} (${cu.symbol})`).join(', ') || '—';
      const area    = c.area?.toLocaleString() || '—';
      const calling = c.idd?.root + (c.idd?.suffixes?.[0] || '') || '—';
      await reply(
        `🌍 *${c.name.common}*  ${c.flag || ''}\n` +
        `${'─'.repeat(28)}\n` +
        `🏛️  Capital    : ${capital}\n` +
        `🌐 Region     : ${region}\n` +
        `👥 Population : ${pop}\n` +
        `📐 Area       : ${area} km²\n` +
        `🗣️  Languages  : ${langs}\n` +
        `💵 Currency   : ${curr}\n` +
        `📞 Calling    : ${calling}\n` +
        `🚗 Driving    : ${c.car?.side || '—'} side\n` +
        `⏰ Timezones  : ${c.timezones?.[0] || '—'}`
      );
    } catch (e) {
      await reply('❌ Country lookup failed: ' + e.message);
    }
  },
};

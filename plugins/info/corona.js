// plugins/info/corona.js
import fetch from 'node-fetch';
export default {
  command: ['corona', 'covid', 'covid19'],
  desc: 'Get COVID-19 stats — .corona Kenya  or  .corona world',
  category: 'info',
  run: async ({ text, reply }) => {
    const query = text?.trim() || 'world';
    try {
      const url = query.toLowerCase() === 'world'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(query)}?strict=true`;
      const res  = await fetch(url);
      const d    = await res.json();
      if (d.message) return reply(`❌ Country *${query}* not found.`);
      const fmt = n => n?.toLocaleString() || '—';
      await reply(
        `🦠 *COVID-19: ${query === 'world' ? '🌍 World' : d.country}*\n` +
        `${'─'.repeat(28)}\n` +
        `😷 Cases     : ${fmt(d.cases)}\n` +
        `💀 Deaths    : ${fmt(d.deaths)}\n` +
        `✅ Recovered : ${fmt(d.recovered)}\n` +
        `🏥 Active    : ${fmt(d.active)}\n` +
        `🆕 Today Cases  : ${fmt(d.todayCases)}\n` +
        `🆕 Today Deaths : ${fmt(d.todayDeaths)}\n` +
        `${'─'.repeat(28)}\n` +
        `_Updated: ${new Date(d.updated).toLocaleString()}_`
      );
    } catch (e) { await reply('❌ COVID stats unavailable: ' + e.message); }
  },
};

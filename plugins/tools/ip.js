// plugins/tools/ip.js
import fetch from 'node-fetch';

export default {
  command: ['ip', 'iplookup'],
  desc: 'Look up IP address info — .ip <address>',
  category: 'tools',
  run: async ({ args, reply }) => {
    const ip = args[0] || '';
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const d   = await res.json();
      if (d.error) return reply(`❌ ${d.reason || 'IP not found'}`);
      await reply(
`🌐 *IP Lookup: ${d.ip}*

📍 City      : ${d.city || '—'}
🗺️  Region    : ${d.region || '—'}
🌍 Country   : ${d.country_name || '—'}
🏢 ISP/Org   : ${d.org || '—'}
🕐 Timezone  : ${d.timezone || '—'}
💱 Currency  : ${d.currency || '—'}
📞 Calling   : +${d.country_calling_code || '—'}`
      );
    } catch {
      await reply('❌ IP lookup failed. Try again.');
    }
  },
};

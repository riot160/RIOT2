// plugins/tools/geoip.js
import fetch from 'node-fetch';
export default {
  command: ['geoip', 'locateip', 'ipmap'],
  desc: 'Geolocate an IP address with map link — .geoip 8.8.8.8',
  category: 'tools',
  run: async ({ args, reply }) => {
    const ip = args[0];
    if (!ip) return reply('Usage: .geoip <ip address>\nExample: .geoip 8.8.8.8');
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const d   = await res.json();
      if (d.error) return reply(`❌ ${d.reason || 'Invalid IP address'}`);
      const mapUrl = `https://maps.google.com/?q=${d.latitude},${d.longitude}`;
      await reply(
        `🗺️ *GeoIP: ${d.ip}*\n` +
        `${'─'.repeat(28)}\n` +
        `📍 City      : ${d.city || '—'}\n` +
        `🗺️  Region    : ${d.region || '—'}\n` +
        `🌍 Country   : ${d.country_name || '—'} ${d.country_code || ''}\n` +
        `🏢 ISP       : ${d.org || '—'}\n` +
        `📡 ASN       : ${d.asn || '—'}\n` +
        `🕐 Timezone  : ${d.timezone || '—'}\n` +
        `📐 Lat/Lon   : ${d.latitude}, ${d.longitude}\n` +
        `${'─'.repeat(28)}\n` +
        `🗺️ Map: ${mapUrl}`
      );
    } catch (e) { await reply('❌ GeoIP lookup failed: ' + e.message); }
  },
};

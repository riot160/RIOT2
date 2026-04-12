// plugins/owner/hostip.js
import fetch from 'node-fetch';

export default {
  command: ['hostip', 'serverip', 'myip'],
  desc: 'Get the server/host public IP and location',
  category: 'owner',
  owner: true,
  run: async ({ reply }) => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const d   = await res.json();
      await reply(
        `🖥️ *Server / Host Info*\n\n` +
        `🌐 IP       : ${d.ip}\n` +
        `📍 City     : ${d.city}\n` +
        `🗺️  Region   : ${d.region}\n` +
        `🌍 Country  : ${d.country_name}\n` +
        `🏢 ISP      : ${d.org}\n` +
        `🕐 Timezone : ${d.timezone}\n` +
        `🟢 Node.js  : ${process.version}\n` +
        `⏱️  Uptime   : ${Math.floor(process.uptime() / 60)}m`
      );
    } catch {
      await reply('❌ Could not fetch host IP.');
    }
  },
};

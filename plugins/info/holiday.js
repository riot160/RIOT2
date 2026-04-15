// plugins/info/holiday.js
import fetch from 'node-fetch';
export default {
  command: ['holiday', 'publicholiday', 'holidays'],
  desc: 'Get public holidays for a country — .holiday KE  or  .holiday US 2025',
  category: 'info',
  run: async ({ args, reply }) => {
    const country = (args[0] || 'KE').toUpperCase();
    const year    = parseInt(args[1]) || new Date().getFullYear();
    try {
      const res  = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`);
      if (!res.ok) return reply(`❌ Country code *${country}* not found.\nUse 2-letter codes: KE, US, GB, NG, ZA, IN, FR, DE`);
      const d    = await res.json();
      if (!d.length) return reply(`No holidays found for *${country}* in ${year}.`);
      let text = `🗓️ *Public Holidays: ${country} (${year})*\n${'─'.repeat(28)}\n\n`;
      d.slice(0, 15).forEach(h => {
        text += `📅 ${h.date}  —  ${h.localName || h.name}\n`;
      });
      await reply(text.trim());
    } catch (e) { await reply('❌ Holiday lookup failed: ' + e.message); }
  },
};

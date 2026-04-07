// plugins/tools/weather.js
import fetch from 'node-fetch';

export default {
  command: 'weather',
  desc: 'Get current weather — .weather Nairobi',
  category: 'tools',
  run: async ({ args, reply }) => {
    const city = args.join(' ');
    if (!city) return reply('Usage: .weather <city name>');
    try {
      const res  = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=4`);
      const data = await res.text();
      await reply(`🌤️ *Weather — ${city}*\n\n${data}`);
    } catch {
      await reply('❌ Could not fetch weather. Try again.');
    }
  },
};

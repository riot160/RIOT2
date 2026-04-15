// plugins/tools/timezone.js
const ZONES = [
  { name: 'Nairobi 🇰🇪',     tz: 'Africa/Nairobi' },
  { name: 'Lagos 🇳🇬',       tz: 'Africa/Lagos' },
  { name: 'London 🇬🇧',      tz: 'Europe/London' },
  { name: 'Dubai 🇦🇪',       tz: 'Asia/Dubai' },
  { name: 'New York 🇺🇸',    tz: 'America/New_York' },
  { name: 'Los Angeles 🇺🇸', tz: 'America/Los_Angeles' },
  { name: 'Tokyo 🇯🇵',       tz: 'Asia/Tokyo' },
  { name: 'Sydney 🇦🇺',      tz: 'Australia/Sydney' },
  { name: 'Johannesburg 🇿🇦',tz: 'Africa/Johannesburg' },
  { name: 'Paris 🇫🇷',       tz: 'Europe/Paris' },
];
export default {
  command: ['timezone', 'worldclock', 'alltime'],
  desc: 'Show time in major world cities — .timezone',
  category: 'tools',
  run: async ({ reply }) => {
    const now  = new Date();
    let text   = `🌍 *World Clock*\n${'─'.repeat(28)}\n\n`;
    ZONES.forEach(z => {
      const t = now.toLocaleTimeString('en-US', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', hour12: false });
      const d = now.toLocaleDateString('en-US', { timeZone: z.tz, weekday: 'short', month: 'short', day: 'numeric' });
      text += `${z.name.padEnd(18)} ${t}  ${d}\n`;
    });
    await reply(text.trim());
  },
};

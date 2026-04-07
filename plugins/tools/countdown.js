// plugins/tools/countdown.js
export default {
  command: ['countdown', 'cd'],
  desc: 'Countdown to a date — .countdown 2025-12-31',
  category: 'tools',
  run: async ({ args, reply }) => {
    const input = args[0];
    if (!input) return reply('Usage: .countdown <YYYY-MM-DD>\nExample: .countdown 2025-12-31');
    const target = new Date(input);
    if (isNaN(target)) return reply('❌ Invalid date. Use format: YYYY-MM-DD');
    const now   = new Date();
    const diff  = target - now;
    if (diff < 0) return reply(`⏰ That date has already passed!\n📅 ${input}`);
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    await reply(
`⏳ *Countdown to ${input}*

📅 Days    : *${days}*
⏰ Hours   : *${hours}*
🕐 Minutes : *${minutes}*`
    );
  },
};

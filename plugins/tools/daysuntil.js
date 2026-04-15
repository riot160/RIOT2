// plugins/tools/daysuntil.js
export default {
  command: ['daysuntil', 'daysleft', 'daysuntildate'],
  desc: 'How many days until any date — .daysuntil 2025-12-25',
  category: 'tools',
  run: async ({ args, reply }) => {
    const input = args[0];
    if (!input) return reply('Usage: .daysuntil <YYYY-MM-DD>\nExample: .daysuntil 2025-12-25');
    const target = new Date(input);
    if (isNaN(target)) return reply('❌ Invalid date. Use YYYY-MM-DD format.');
    const now   = new Date();
    const diff  = target - now;
    const days  = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return reply(`🎉 *${input}* is TODAY!`);
    if (days < 0)  return reply(`📅 *${input}* was *${Math.abs(days)}* days ago.`);
    const months = Math.floor(days / 30);
    const weeks  = Math.floor(days / 7);
    await reply(
      `📅 *Days Until ${input}*\n\n` +
      `📆 Days   : *${days}*\n` +
      `📅 Weeks  : *${weeks}*\n` +
      `🗓️  Months : ~${months}\n\n` +
      `_That\'s ${new Date(target).toDateString()}_`
    );
  },
};

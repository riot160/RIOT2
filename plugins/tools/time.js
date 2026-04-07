// plugins/tools/time.js
export default {
  command: ['time', 'date'],
  desc: 'Show current date/time — .time  or  .time America/New_York',
  category: 'tools',
  run: async ({ args, reply }) => {
    const tz = args.join(' ') || 'Africa/Nairobi';
    try {
      const now = new Date().toLocaleString('en-US', {
        timeZone:  tz,
        dateStyle: 'full',
        timeStyle: 'long',
      });
      await reply(`🕐 *Date & Time*\n📍 Timezone: ${tz}\n\n${now}`);
    } catch {
      await reply(
        `❌ Unknown timezone: *${tz}*\nExample timezones:\n` +
        `• Africa/Nairobi\n• America/New_York\n• Europe/London\n• Asia/Dubai`
      );
    }
  },
};

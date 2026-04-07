// plugins/tools/remind.js
export default {
  command: ['remind', 'reminder'],
  desc: 'Set a reminder — .remind <minutes> <message>',
  category: 'tools',
  run: async ({ args, sock, jid, reply }) => {
    const minutes = parseInt(args[0]);
    const message = args.slice(1).join(' ');
    if (!minutes || isNaN(minutes) || !message)
      return reply('Usage: .remind <minutes> <message>\nExample: .remind 10 Drink water 💧');
    if (minutes > 1440) return reply('❌ Maximum reminder time is 1440 minutes (24 hours).');
    await reply(`⏰ *Reminder set!*\n\n⏱️ Time    : ${minutes} minute(s)\n📝 Message : ${message}`);
    setTimeout(async () => {
      await sock.sendMessage(jid, {
        text: `⏰ *REMINDER*\n\n📝 ${message}`,
      }).catch(() => {});
    }, minutes * 60 * 1000);
  },
};

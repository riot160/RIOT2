// plugins/tools/getabout.js
export default {
  command: ['getabout', 'bio', 'about'],
  desc: 'Get someone\'s WhatsApp bio/about — .getabout @user',
  category: 'tools',
  run: async ({ sock, msg, args, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const numArg    = (args[0] || '').replace(/[^0-9]/g, '');
    const target    = mentioned[0] || quoted
      || (numArg ? numArg + '@s.whatsapp.net' : null);

    if (!target)
      return reply('Usage: .getabout @user\nOr reply to their message with .getabout');

    try {
      const status = await sock.fetchStatus(target);
      const num    = target.split('@')[0];
      await reply(
        `📝 *WhatsApp About*\n\n` +
        `👤 Number : +${num}\n` +
        `📄 About  : ${status?.status || 'No bio set'}`
      );
    } catch {
      await reply('❌ Could not fetch bio. The account may be private.');
    }
  },
};

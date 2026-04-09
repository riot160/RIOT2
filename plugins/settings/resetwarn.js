// plugins/settings/resetwarn.js
import { getUser, saveUser } from '../../lib/database.js';

export default {
  command: 'resetwarn',
  desc: 'Clear all warnings for a user — reply or mention them',
  category: 'settings',
  owner: true,
  run: async ({ msg, args, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const numArg    = (args[0] || '').replace(/[^0-9]/g, '');
    const target    = mentioned[0] || quoted;
    const num       = target ? target.split('@')[0] : numArg;
    if (!num)
      return reply('Usage: .resetwarn @user\nOr reply to their message with .resetwarn\nOr: .resetwarn 254700000000');
    const user   = await getUser(num);
    const before = user.warns || 0;
    user.warns   = 0;
    await saveUser(num, user);
    await reply(`✅ *Warnings Cleared*\n\n📱 User: +${num}\n⚠️ Removed: ${before} warning(s)\nNew total: 0`);
  },
};

// plugins/group/resetwarn.js
import { getUser, saveUser } from '../../lib/database.js';

export default {
  command: ['resetwarn', 'clearwarn'],
  desc: 'Reset all warnings for a member',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target    = mentioned[0] || quoted;
    if (!target) return reply('Mention or reply to the user.\nExample: .resetwarn @user');
    const num  = target.split('@')[0];
    const user = await getUser(num);
    user.warns = 0;
    await saveUser(num, user);
    await reply(`✅ Warnings cleared for @${num}`);
  },
};

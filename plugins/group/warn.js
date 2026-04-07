// plugins/group/warn.js
import { getUser, saveUser } from '../../lib/database.js';

const MAX_WARNS = 3;

export default {
  command: 'warn',
  desc: `Warn a member — after ${MAX_WARNS} warns they are removed`,
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, msg, args, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target    = mentioned[0] || quoted;
    if (!target) return reply('Mention or reply to the user to warn.\nExample: .warn @user spamming');

    const reason = (mentioned.length ? args.slice(1) : args).join(' ') || 'No reason given';
    const num    = target.split('@')[0];
    const user   = await getUser(num);
    user.warns   = (user.warns || 0) + 1;
    await saveUser(num, user);

    await sock.sendMessage(jid, {
      text: `⚠️ *Warning ${user.warns}/${MAX_WARNS}*\n\n👤 @${num}\n📝 Reason: ${reason}`,
      mentions: [target],
    });

    if (user.warns >= MAX_WARNS) {
      await sock.groupParticipantsUpdate(jid, [target], 'remove');
      user.warns = 0;
      await saveUser(num, user);
      await reply(`🔨 @${num} has been removed after *${MAX_WARNS} warnings*.`);
    }
  },
};

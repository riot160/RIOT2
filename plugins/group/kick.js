// plugins/group/kick.js
export default {
  command: ['kick', 'remove'],
  desc: 'Remove a member from the group — reply or mention',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const targets   = mentioned.length ? mentioned : quoted ? [quoted] : [];
    if (!targets.length) return reply('Mention or reply to the user you want to kick.\nExample: .kick @user');
    await sock.groupParticipantsUpdate(jid, targets, 'remove');
    await reply(`✅ Kicked *${targets.length}* member(s)`);
  },
};

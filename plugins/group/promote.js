// plugins/group/promote.js
export default {
  command: 'promote',
  desc: 'Promote a member to group admin',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const targets   = mentioned.length ? mentioned : quoted ? [quoted] : [];
    if (!targets.length) return reply('Mention or reply to the user to promote.\nExample: .promote @user');
    await sock.groupParticipantsUpdate(jid, targets, 'promote');
    await reply(`⬆️ Promoted *${targets.length}* member(s) to admin`);
  },
};

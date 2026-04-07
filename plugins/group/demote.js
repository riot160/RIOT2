// plugins/group/demote.js
export default {
  command: 'demote',
  desc: 'Demote a group admin to member',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, msg, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const targets   = mentioned.length ? mentioned : quoted ? [quoted] : [];
    if (!targets.length) return reply('Mention or reply to the admin to demote.\nExample: .demote @user');
    await sock.groupParticipantsUpdate(jid, targets, 'demote');
    await reply(`⬇️ Demoted *${targets.length}* admin(s) to member`);
  },
};

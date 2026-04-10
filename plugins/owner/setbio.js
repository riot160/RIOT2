// plugins/owner/setbio.js
export default {
  command: ['setbio', 'setabout'],
  desc: 'Set the bot\'s WhatsApp bio/about text — .setbio <text>',
  category: 'owner',
  owner: true,
  run: async ({ text, sock, reply }) => {
    if (!text)
      return reply('Usage: .setbio <text>\nExample: .setbio ⚡ RIOT MD | Always Online');
    try {
      await sock.updateProfileStatus(text);
      await reply(`✅ *Bio Updated*\n\n_"${text}"_`);
    } catch (e) {
      await reply('❌ Failed to update bio: ' + e.message);
    }
  },
};

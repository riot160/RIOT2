// plugins/owner/join.js
export default {
  command: 'join',
  desc: 'Join a WhatsApp group via invite link — .join <link>',
  category: 'owner',
  owner: true,
  run: async ({ sock, args, reply }) => {
    const link = args[0];
    if (!link)
      return reply('Usage: .join <invite link>\nExample: .join https://chat.whatsapp.com/XXXXXXX');
    const code = link.split('chat.whatsapp.com/')[1]?.trim();
    if (!code)
      return reply('❌ Invalid invite link. Must be: https://chat.whatsapp.com/XXXXX');
    try {
      await sock.groupAcceptInvite(code);
      await reply(`✅ *Joined group successfully!*`);
    } catch (e) {
      await reply('❌ Could not join group: ' + e.message);
    }
  },
};

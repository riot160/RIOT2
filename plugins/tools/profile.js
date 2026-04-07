// plugins/tools/profile.js
export default {
  command: ['profile', 'pfp', 'pp'],
  desc: 'Get a contact\'s profile picture — .profile @user  or just .profile',
  category: 'tools',
  run: async ({ sock, jid, msg, args, reply }) => {
    // check for mentioned user or quoted message sender
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const numArg    = args[0]?.replace(/[^0-9]/g, '');

    const target = mentioned || quoted
      || (numArg ? numArg + '@s.whatsapp.net' : jid);

    try {
      const url = await sock.profilePictureUrl(target, 'image');
      const display = target.split('@')[0];
      await sock.sendMessage(
        jid,
        { image: { url }, caption: `👤 *Profile Picture*\n📱 ${display}` },
        { quoted: msg }
      );
    } catch {
      await reply('❌ Could not fetch profile picture.\nThe account may be private or have no picture set.');
    }
  },
};

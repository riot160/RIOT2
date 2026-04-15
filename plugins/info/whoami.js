// plugins/info/whoami.js
export default {
  command: ['whoami', 'myinfo', 'me'],
  desc: 'Show your WhatsApp info card',
  category: 'info',
  run: async ({ sock, jid, sender, senderNumber, pushName, isGroup, isOwner, msg, reply }) => {
    let ppUrl = null;
    try { ppUrl = await sock.profilePictureUrl(sender, 'image'); } catch {}
    let status = '';
    try {
      const s = await sock.fetchStatus(sender);
      status = s?.status || '';
    } catch {}
    const text =
      `👤 *Your Info*\n` +
      `${'─'.repeat(26)}\n` +
      `📛 Name     : ${pushName}\n` +
      `📱 Number   : +${senderNumber}\n` +
      `🆔 JID      : ${sender}\n` +
      `📝 Bio      : ${status || 'Not set'}\n` +
      `👑 Owner    : ${isOwner ? 'Yes ✅' : 'No'}\n` +
      `👥 In Group : ${isGroup ? 'Yes' : 'No (DM)'}`;
    if (ppUrl) {
      await sock.sendMessage(jid, { image: { url: ppUrl }, caption: text }, { quoted: msg });
    } else {
      await reply(text);
    }
  },
};

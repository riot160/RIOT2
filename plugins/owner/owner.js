// plugins/owner/owner.js
import { config } from '../../config.js';

export default {
  command: 'owner',
  desc: 'Show the bot owner contact info',
  category: 'owner',
  run: async ({ sock, jid, msg, reply }) => {
    const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
    let ppUrl = null;
    try {
      ppUrl = await sock.profilePictureUrl(ownerJid, 'image');
    } catch {}

    const text =
      `👑 *BOT OWNER*\n\n` +
      `👤 Name   : ${config.OWNER_NAME || config.DEVELOPER}\n` +
      `📱 Number : +${config.OWNER_NUMBER}\n` +
      `🤖 Bot    : ${config.BOT_NAME} ${config.BOT_VERSION}\n\n` +
      `_Contact the owner for support or feedback._`;

    if (ppUrl) {
      await sock.sendMessage(jid, { image: { url: ppUrl }, caption: text }, { quoted: msg });
    } else {
      await reply(text);
    }
  },
};

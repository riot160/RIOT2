// plugins/owner/feedback.js
import { config } from '../../config.js';

export default {
  command: 'feedback',
  desc: 'Send feedback or suggestions to the bot owner',
  category: 'owner',
  run: async ({ text, sock, senderNumber, pushName, reply }) => {
    if (!text)
      return reply(
        'Usage: .feedback <your message>\n\n' +
        'Example: .feedback The .play command is not working for me'
      );
    await reply('✅ *Feedback sent!* Thank you for helping improve RIOT MD.');
    const oJid = config.OWNER_NUMBER + '@s.whatsapp.net';
    await sock.sendMessage(oJid, {
      text:
        `💬 *New Feedback*\n` +
        `👤 From   : ${pushName} (+${senderNumber})\n` +
        `📝 Message: ${text}`,
    }).catch(() => {});
  },
};

// plugins/tools/report.js
import { config } from '../../config.js';

export default {
  command: 'report',
  desc: 'Send a report/feedback to the bot owner',
  category: 'tools',
  run: async ({ text, sock, senderNumber, pushName, reply }) => {
    if (!text) return reply('Usage: .report <your message>\nExample: .report The .play command is not working');
    await reply('✅ *Report sent!* Thank you for the feedback.');
    const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
    await sock.sendMessage(ownerJid, {
      text: `📢 *New User Report*\n\n👤 From   : ${pushName} (${senderNumber})\n📝 Report : ${text}`,
    }).catch(() => {});
  },
};

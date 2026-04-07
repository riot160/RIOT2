// plugins/owner/broadcast.js
import { sessions } from '../../lib/session.js';

export default {
  command: 'broadcast',
  desc: 'Broadcast a message to all active sessions',
  category: 'owner',
  owner: true,
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .broadcast <message>');
    let sent = 0, failed = 0;
    for (const [, s] of sessions) {
      if (s.status !== 'connected' || !s.phoneNumber) continue;
      try {
        await s.sock.sendMessage(
          s.phoneNumber + '@s.whatsapp.net',
          { text: `📢 *RIOT MD Broadcast*\n\n${text}` }
        );
        sent++;
      } catch { failed++; }
    }
    await reply(`📢 *Broadcast complete*\n\n✅ Sent   : ${sent}\n❌ Failed : ${failed}`);
  },
};

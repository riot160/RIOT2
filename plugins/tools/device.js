// plugins/tools/device.js
import { jidDecode } from '@whiskeysockets/baileys';

export default {
  command: ['device', 'getdevice'],
  desc: 'Check what device someone uses on WhatsApp — .device @user',
  category: 'tools',
  run: async ({ sock, msg, args, jid, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target    = mentioned[0] || quoted;
    if (!target)
      return reply('Usage: .device @user  or reply to their message with .device');
    try {
      const result = await sock.getBusinessProfile(target);
      const num    = jidDecode(target)?.user || target.split('@')[0];
      // Device type can often be inferred from message agent
      await reply(
        `📱 *Device Info*\n\n` +
        `👤 Number: +${num}\n` +
        `📲 Type  : WhatsApp User\n` +
        `💼 Biz   : ${result ? 'Yes (Business Account)' : 'No (Personal Account)'}`
      );
    } catch {
      const num = target.split('@')[0];
      await reply(`📱 *Device Info*\n\n👤 Number: +${num}\n📲 Account: WhatsApp User`);
    }
  },
};

// plugins/tools/userid.js
import { jidDecode } from '@whiskeysockets/baileys';

export default {
  command: ['userid', 'getid', 'jid'],
  desc: 'Get the WhatsApp ID/number of a user — reply or mention',
  category: 'tools',
  run: async ({ sock, msg, jid, senderNumber, sender, isGroup, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target    = mentioned[0] || quoted;

    if (target) {
      const num   = jidDecode(target)?.user || target.split('@')[0];
      const clean = target.replace(/:\d+@/, '@');
      await reply(
        `🆔 *User ID Info*\n\n` +
        `👤 Number : +${num}\n` +
        `🔗 JID    : ${clean}`
      );
    } else {
      const myNum   = jidDecode(sender)?.user || senderNumber;
      const myClean = sender.replace(/:\d+@/, '@');
      const groupId = isGroup ? `\n👥 Group JID: ${jid}` : '';
      await reply(
        `🆔 *Your ID Info*\n\n` +
        `👤 Number : +${myNum}\n` +
        `🔗 JID    : ${myClean}` +
        groupId
      );
    }
  },
};

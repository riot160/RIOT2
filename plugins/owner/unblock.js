// plugins/owner/unblock.js
export default {
  command: 'unblock',
  desc: 'Unblock a WhatsApp contact — .unblock <number>',
  category: 'owner',
  owner: true,
  run: async ({ args, sock, reply }) => {
    const num = (args[0] || '').replace(/[^0-9]/g, '');
    if (!num) return reply('Usage: .unblock <phone number>');
    const jid = num + '@s.whatsapp.net';
    await sock.updateBlockStatus(jid, 'unblock');
    await reply(`✅ *Unblocked:* ${num}`);
  },
};

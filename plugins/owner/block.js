// plugins/owner/block.js
export default {
  command: 'block',
  desc: 'Block a WhatsApp contact — .block <number>',
  category: 'owner',
  owner: true,
  run: async ({ args, sock, reply }) => {
    const num = (args[0] || '').replace(/[^0-9]/g, '');
    if (!num) return reply('Usage: .block <phone number>\nExample: .block 254700000000');
    const jid = num + '@s.whatsapp.net';
    await sock.updateBlockStatus(jid, 'block');
    await reply(`🚫 *Blocked:* ${num}`);
  },
};

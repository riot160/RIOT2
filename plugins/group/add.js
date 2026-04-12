// plugins/group/add.js
export default {
  command: 'add',
  desc: 'Add a member to the group — .add 254700000000',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, args, reply }) => {
    const num = (args[0] || '').replace(/[^0-9]/g, '');
    if (!num) return reply('Usage: .add <phone number>\nExample: .add 254700000000');
    const target = num + '@s.whatsapp.net';
    try {
      const result = await sock.groupParticipantsUpdate(jid, [target], 'add');
      const status = result?.[0]?.status;
      if (status === '200' || status === 200) {
        await reply(`✅ *Added:* @${num}`, { mentions: [target] });
      } else if (status === '403') {
        await reply(`❌ @${num} has privacy settings that prevent adding.`);
      } else if (status === '408') {
        await reply(`❌ @${num} is not on WhatsApp or the number is invalid.`);
      } else {
        await reply(`⚠️ Could not add @${num} (status: ${status})`);
      }
    } catch (e) {
      await reply('❌ Failed to add member: ' + e.message);
    }
  },
};

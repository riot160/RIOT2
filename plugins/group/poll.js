// plugins/group/poll.js
export default {
  command: 'poll',
  desc: 'Create a poll — .poll Question | Option1 | Option2 | Option3',
  category: 'group',
  group: true,
  run: async ({ sock, jid, text, reply }) => {
    if (!text?.includes('|'))
      return reply(
        '📊 Usage: .poll Question | Option1 | Option2\n\n' +
        'Example:\n.poll Best fruit? | Mango | Apple | Banana'
      );
    const parts   = text.split('|').map(s => s.trim()).filter(Boolean);
    const name    = parts[0];
    const values  = parts.slice(1);
    if (values.length < 2) return reply('❌ You need at least *2 options*.');
    if (values.length > 12) return reply('❌ Maximum *12 options* allowed.');
    await sock.sendMessage(jid, {
      poll: { name, values, selectableCount: 1 },
    });
  },
};

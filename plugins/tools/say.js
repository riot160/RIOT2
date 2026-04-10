// plugins/tools/say.js
export default {
  command: 'say',
  desc: 'Make the bot say something — .say Hello world!',
  category: 'tools',
  run: async ({ text, sock, jid, reply }) => {
    if (!text) return reply('Usage: .say <message>\nExample: .say Good morning everyone!');
    await sock.sendMessage(jid, { text });
  },
};

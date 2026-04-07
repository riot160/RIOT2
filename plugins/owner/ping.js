// plugins/owner/ping.js
export default {
  command: ['ping', 'speed'],
  desc: 'Check bot response speed',
  category: 'owner',
  run: async ({ reply }) => {
    const start = Date.now();
    await reply('⏱️ Pinging…');
    await reply(`🏓 *Pong!*\n\n⚡ Response : *${Date.now() - start}ms*\n🟢 Status   : Online`);
  },
};

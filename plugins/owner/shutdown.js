// plugins/owner/shutdown.js
export default {
  command: ['shutdown', 'stop'],
  desc: 'Shutdown the bot process',
  category: 'owner',
  owner: true,
  run: async ({ reply }) => {
    await reply('👋 *RIOT MD shutting down…*\nGoodbye!');
    setTimeout(() => process.exit(0), 1500);
  },
};

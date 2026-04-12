// plugins/owner/restart.js
export default {
  command: ['restart', 'reboot'],
  desc: 'Restart the bot process (PM2 / Railway will auto-restart)',
  category: 'owner',
  owner: true,
  run: async ({ reply }) => {
    await reply('🔄 *RIOT MD restarting…*\n\n_Bot will be back in a few seconds._');
    setTimeout(() => process.exit(0), 2000);
  },
};

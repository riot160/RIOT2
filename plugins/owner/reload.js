// plugins/owner/reload.js
import { loadPlugins } from '../../lib/commands.js';

export default {
  command: ['reload', 'reloadplugins'],
  desc: 'Reload all plugins without restarting the bot',
  category: 'owner',
  owner: true,
  run: async ({ reply }) => {
    await reply('♻️ Reloading plugins…');
    const count = await loadPlugins('./plugins');
    await reply(`✅ *Reload complete!*\n📦 Loaded *${count}* plugins`);
  },
};

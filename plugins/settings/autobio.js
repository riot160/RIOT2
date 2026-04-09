// plugins/settings/autobio.js
import { dbGet, dbSet } from '../../lib/database.js';
import { config }       from '../../config.js';

export default {
  command: 'autobio',
  desc: 'Auto-update your WhatsApp bio with live stats — .autobio on/off',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, sock, reply }) => {
    const val = args[0]?.toLowerCase();
    if (!['on','off'].includes(val))
      return reply('Usage: .autobio on\n       .autobio off');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.autobio = val === 'on';
    await dbSet(`settings:${userId}`, s);

    if (s.autobio) {
      // Start interval to update bio every 5 minutes
      const updateBio = async () => {
        const settings = (await dbGet(`settings:${userId}`)) || {};
        if (!settings.autobio) return;
        const up  = process.uptime();
        const bio = `⚡ ${config.BOT_NAME} | Uptime: ${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m | Node ${process.version}`;
        await sock.updateProfileStatus(bio).catch(() => {});
      };
      await updateBio();
      const interval = setInterval(updateBio, 5 * 60 * 1000);
      // Store interval id so it can be cleared on off
      s._autobioInterval = true;
      await dbSet(`settings:${userId}`, s);
      await reply('✍️ *Auto Bio → ON*\nYour WhatsApp bio will update every 5 minutes with live bot stats.');
    } else {
      await reply('✍️ *Auto Bio → OFF*\nBio will no longer auto-update.');
    }
  },
};

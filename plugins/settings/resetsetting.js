// plugins/settings/resetsetting.js
import { dbSet } from '../../lib/database.js';
import { config } from '../../config.js';

export default {
  command: ['resetsetting', 'resetsettings'],
  desc: 'Reset ALL bot settings back to default values',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    // Reset runtime config back to defaults
    config.MODE   = 'public';
    config.PREFIX = '.';

    // Wipe the session settings from DB
    await dbSet(`settings:${userId}`, {});

    await reply(
      `♻️ *All Settings Reset*\n\n` +
      `Everything is back to default:\n` +
      `• Prefix: .\n` +
      `• Mode: Public\n` +
      `• All auto features: OFF\n` +
      `• All protection: OFF\n\n` +
      `_Use .getsettings to verify._`
    );
  },
};

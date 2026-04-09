// plugins/settings/setbotname.js
import { config } from '../../config.js';
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setbotname',
  desc: 'Change the bot display name — .setbotname RIOT MD',
  category: 'settings',
  owner: true,
  run: async ({ text, userId, reply }) => {
    if (!text)
      return reply('Usage: .setbotname <name>\nExample: .setbotname RIOT MD Ultra');
    const old = config.BOT_NAME;
    config.BOT_NAME = text;
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.botName = text;
    await dbSet(`settings:${userId}`, s);
    await reply(
      `✅ *Bot Name Changed*\n\n` +
      `Old: ${old}\n` +
      `New: *${text}*`
    );
  },
};

// plugins/settings/setprefix.js
import { config } from '../../config.js';
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setprefix',
  desc: 'Change the bot command prefix — .setprefix !',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const newPrefix = args[0];
    if (!newPrefix)
      return reply('Usage: .setprefix <prefix>\nExamples: .setprefix !   .setprefix /   .setprefix #');
    const old = config.PREFIX;
    config.PREFIX = newPrefix;
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.prefix = newPrefix;
    await dbSet(`settings:${userId}`, s);
    await reply(
      `✅ *Prefix Changed*\n\n` +
      `Old prefix: \`${old}\`\n` +
      `New prefix: \`${newPrefix}\`\n\n` +
      `Try it: \`${newPrefix}menu\``
    );
  },
};

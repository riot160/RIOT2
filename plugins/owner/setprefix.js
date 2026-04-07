// plugins/owner/setprefix.js
import { config } from '../../config.js';

export default {
  command: 'setprefix',
  desc: 'Change the bot command prefix — .setprefix !',
  category: 'owner',
  owner: true,
  run: async ({ args, reply }) => {
    const newPrefix = args[0];
    if (!newPrefix) return reply('Usage: .setprefix <new prefix>\nExample: .setprefix !');
    const old = config.PREFIX;
    config.PREFIX = newPrefix;
    await reply(`✅ *Prefix changed*\n\nOld: \`${old}\`\nNew: \`${newPrefix}\`\n\nUse \`${newPrefix}menu\` to test it.`);
  },
};

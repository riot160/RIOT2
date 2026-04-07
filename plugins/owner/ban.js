// plugins/owner/ban.js
import { getUser, saveUser } from '../../lib/database.js';

export default {
  command: 'ban',
  desc: 'Ban a user from using bot commands — .ban <number>',
  category: 'owner',
  owner: true,
  run: async ({ args, reply }) => {
    const num = (args[0] || '').replace(/[^0-9]/g, '');
    if (!num) return reply('Usage: .ban <phone number>');
    const user = await getUser(num);
    user.banned = true;
    await saveUser(num, user);
    await reply(`🔨 *Banned:* ${num}\nThis user can no longer use bot commands.`);
  },
};

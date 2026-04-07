// plugins/owner/unban.js
import { getUser, saveUser } from '../../lib/database.js';

export default {
  command: 'unban',
  desc: 'Unban a user — .unban <number>',
  category: 'owner',
  owner: true,
  run: async ({ args, reply }) => {
    const num = (args[0] || '').replace(/[^0-9]/g, '');
    if (!num) return reply('Usage: .unban <phone number>');
    const user = await getUser(num);
    user.banned = false;
    await saveUser(num, user);
    await reply(`✅ *Unbanned:* ${num}\nThis user can use bot commands again.`);
  },
};

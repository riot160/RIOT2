// plugins/settings/delignorelist.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'delignorelist',
  desc: 'Remove a number from the ignore list — .delignorelist 254700000000',
  category: 'settings',
  owner: true,
  run: async ({ args, msg, userId, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const num = mentioned[0]
      ? mentioned[0].split('@')[0]
      : (args[0] || '').replace(/[^0-9]/g, '');
    if (!num)
      return reply('Usage: .delignorelist <number>  or  .delignorelist @user');
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.ignoreList || [];
    if (!list.includes(num))
      return reply(`❌ *+${num}* is not on the ignore list.`);
    s.ignoreList = list.filter(n => n !== num);
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Removed from Ignore List*\n\n👤 +${num}\nBot will respond to this number again.`);
  },
};

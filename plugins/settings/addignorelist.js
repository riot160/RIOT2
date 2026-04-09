// plugins/settings/addignorelist.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'addignorelist',
  desc: 'Bot will completely ignore messages from this number — .addignorelist 254700000000',
  category: 'settings',
  owner: true,
  run: async ({ args, msg, userId, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const num = mentioned[0]
      ? mentioned[0].split('@')[0]
      : (args[0] || '').replace(/[^0-9]/g, '');
    if (!num)
      return reply('Usage: .addignorelist <number>  or  .addignorelist @user');
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.ignoreList || [];
    if (list.includes(num))
      return reply(`⚠️ *+${num}* is already on the ignore list.`);
    list.push(num);
    s.ignoreList = list;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Added to Ignore List*\n\n👤 +${num}\nBot will now ignore all messages from this number.`);
  },
};

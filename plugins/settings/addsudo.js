// plugins/settings/addsudo.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'addsudo',
  desc: 'Give a user sudo (sub-owner) access — .addsudo 254700000000',
  category: 'settings',
  owner: true,
  run: async ({ args, msg, userId, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const num = mentioned[0]
      ? mentioned[0].split('@')[0]
      : (args[0] || '').replace(/[^0-9]/g, '');
    if (!num)
      return reply('Usage: .addsudo <number>  or  .addsudo @user\nExample: .addsudo 254700000000');
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.sudoList || [];
    if (list.includes(num))
      return reply(`⚠️ *+${num}* already has sudo access.`);
    list.push(num);
    s.sudoList = list;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Sudo Access Granted*\n\n👤 +${num}\nThis user can now use owner commands.\nTotal sudo users: ${list.length}`);
  },
};

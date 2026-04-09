// plugins/settings/delsudo.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'delsudo',
  desc: 'Remove sudo access from a user — .delsudo 254700000000',
  category: 'settings',
  owner: true,
  run: async ({ args, msg, userId, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const num = mentioned[0]
      ? mentioned[0].split('@')[0]
      : (args[0] || '').replace(/[^0-9]/g, '');
    if (!num)
      return reply('Usage: .delsudo <number>  or  .delsudo @user');
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.sudoList || [];
    if (!list.includes(num))
      return reply(`❌ *+${num}* does not have sudo access.`);
    s.sudoList = list.filter(n => n !== num);
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Sudo Access Removed*\n\n👤 +${num}\nRemaining sudo users: ${s.sudoList.length}`);
  },
};

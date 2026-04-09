// plugins/settings/addsudo.js
import { dbGet, dbSet } from '../../lib/database.js';

// Normalize phone numbers for consistent comparison
function normalizeNumber(num) {
  const cleaned = String(num).replace(/\D/g, '');
  // Handle both 254 and 0 prefix for Kenya numbers (and other countries)
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('0')) return '254' + cleaned.slice(1);
  return cleaned;
}

export default {
  command: 'addsudo',
  desc: 'Give a user sudo (sub-owner) access — .addsudo 254700000000',
  category: 'settings',
  owner: true,
  run: async ({ args, msg, userId, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const rawNum = mentioned[0]
      ? mentioned[0].split('@')[0]
      : (args[0] || '').replace(/[^0-9]/g, '');
    
    // Normalize the number to standard format
    const num = normalizeNumber(rawNum);
    
    if (!num || num.length < 9)
      return reply('Usage: .addsudo <number>  or  .addsudo @user\nExample: .addsudo 254700000000');
    
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.sudoList || [];
    
    // Check if already has sudo (compare normalized versions)
    const alreadyExists = list.some(existing => normalizeNumber(existing) === num);
    if (alreadyExists)
      return reply(`⚠️ *+${num}* already has sudo access.`);
    
    list.push(num);
    s.sudoList = list;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Sudo Access Granted*\n\n👤 +${num}\nThis user can now use owner commands.\nTotal sudo users: ${list.length}`);
  },
};

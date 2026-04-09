// plugins/settings/delsudo.js
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
  command: 'delsudo',
  desc: 'Remove sudo access from a user — .delsudo 254700000000',
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
      return reply('Usage: .delsudo <number>  or  .delsudo @user');
    
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.sudoList || [];
    
    // Find and remove by normalized comparison
    const indexToRemove = list.findIndex(existing => normalizeNumber(existing) === num);
    if (indexToRemove === -1)
      return reply(`❌ *+${num}* does not have sudo access.`);
    
    list.splice(indexToRemove, 1);
    s.sudoList = list;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Sudo Access Removed*\n\n👤 +${num}\nRemaining sudo users: ${s.sudoList.length}`);
  },
};

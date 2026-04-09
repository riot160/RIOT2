// plugins/settings/deletebadword.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'deletebadword',
  desc: 'Remove a word from the bad-word filter — .deletebadword <word>',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const word = args[0]?.toLowerCase().trim();
    if (!word)
      return reply('Usage: .deletebadword <word>\nExample: .deletebadword spam');
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const list = s.badwords || [];
    if (!list.includes(word))
      return reply(`❌ *"${word}"* is not in the bad-word list.`);
    s.badwords = list.filter(w => w !== word);
    await dbSet(`settings:${userId}`, s);
    await reply(`🗑️ *Bad Word Removed*\n\nWord: *${word}*\nRemaining: ${s.badwords.length} word(s)`);
  },
};

// plugins/settings/addbadword.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'addbadword',
  desc: 'Add a word to the bad-word filter — .addbadword <word>',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const word = args[0]?.toLowerCase().trim();
    if (!word)
      return reply('Usage: .addbadword <word>\nExample: .addbadword spam\nYou can add one word at a time.');
    const s   = (await dbGet(`settings:${userId}`)) || {};
    const list = s.badwords || [];
    if (list.includes(word))
      return reply(`⚠️ *"${word}"* is already in the bad-word list.`);
    list.push(word);
    s.badwords = list;
    await dbSet(`settings:${userId}`, s);
    await reply(
      `✅ *Bad Word Added*\n\n` +
      `Word: *${word}*\n` +
      `Total banned words: ${list.length}\n\n` +
      `_Enable antibadword in a group with .antibadword on_`
    );
  },
};

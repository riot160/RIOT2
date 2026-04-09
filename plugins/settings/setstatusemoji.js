// plugins/settings/setstatusemoji.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setstatusemoji',
  desc: 'Set emoji used when auto-reacting to statuses — .setstatusemoji 🔥',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const emoji = args[0];
    if (!emoji)
      return reply('Usage: .setstatusemoji <emoji>\nExample: .setstatusemoji 🔥\nDefault is 🔥');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.statusEmoji = emoji;
    await dbSet(`settings:${userId}`, s);
    await reply(
      `✅ *Status React Emoji Set*\n\n` +
      `Emoji: ${emoji}\n\n` +
      `Make sure .autoreactstatus is ON to use this.`
    );
  },
};

// plugins/settings/listwarn.js
import { dbAll } from '../../lib/database.js';

export default {
  command: 'listwarn',
  desc: 'List all users who have warnings',
  category: 'settings',
  owner: true,
  run: async ({ reply }) => {
    const all     = await dbAll();
    const warned  = Object.entries(all)
      .filter(([k, v]) => k.startsWith('user:') && v.warns > 0)
      .sort(([, a], [, b]) => b.warns - a.warns);
    if (!warned.length)
      return reply('✅ *No warned users found.*\nEveryone is clean!');
    let text = `⚠️ *Warned Users*\n${'─'.repeat(24)}\n\n`;
    warned.forEach(([key, user], i) => {
      const num = key.replace('user:', '');
      text += `${i + 1}. +${num}\n   Warnings: *${user.warns}*\n`;
    });
    text += `\n_Use .resetwarn @user to clear warnings._`;
    await reply(text);
  },
};

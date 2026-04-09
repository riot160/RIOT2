// plugins/settings/setanticallmsg.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setanticallmsg',
  desc: 'Set the message sent when a call is rejected — .setanticallmsg <text>',
  category: 'settings',
  owner: true,
  run: async ({ text, userId, reply }) => {
    if (!text)
      return reply('Usage: .setanticallmsg <message>\nExample: .setanticallmsg Sorry, I do not accept calls. Please text me.');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.anticallMsg = text;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Anti Call Message Set*\n\n_"${text}"_\n\nThis will be sent to callers when anticall is ON.`);
  },
};

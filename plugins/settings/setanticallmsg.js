// plugins/settings/setanticallmsg.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'setanticallmsg',
  desc: 'Set the message sent to callers when anticall is ON — .setanticallmsg <text>',
  category: 'settings',
  owner: true,
  run: async ({ text, userId, reply }) => {
    if (!text)
      return reply(
        'Usage: .setanticallmsg <message>\n\n' +
        'Example:\n.setanticallmsg Sorry, no calls. Please text me 📱\n\n' +
        'This message is sent to anyone who calls when anticall is ON.'
      );
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.anticallMsg = text;
    await dbSet(`settings:${userId}`, s);
    await reply(
      `✅ *Anti-Call Message Saved*\n\n` +
      `"${text}"\n\n` +
      `This will be sent to callers automatically.\n` +
      `Make sure .anticall is ON.`
    );
  },
};

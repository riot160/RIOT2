// plugins/settings/statusdelay.js
import { dbGet, dbSet } from '../../lib/database.js';

export default {
  command: 'statusdelay',
  desc: 'Set delay (seconds) between auto-viewing statuses — .statusdelay 3',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const sec = parseInt(args[0]);
    if (isNaN(sec) || sec < 0 || sec > 60)
      return reply('Usage: .statusdelay <seconds>\nExample: .statusdelay 3\nRange: 0–60 seconds');
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.statusDelay = sec * 1000;
    await dbSet(`settings:${userId}`, s);
    await reply(
      `⏱️ *Status View Delay Set*\n\n` +
      `Delay: *${sec} second(s)*\n\n` +
      `Bot will wait ${sec}s between viewing each status.`
    );
  },
};

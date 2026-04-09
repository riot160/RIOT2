// plugins/settings/settimezone.js
import { dbGet, dbSet } from '../../lib/database.js';

const COMMON_ZONES = [
  'Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg',
  'America/New_York', 'America/Los_Angeles', 'Europe/London',
  'Europe/Paris', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland',
];

export default {
  command: 'settimezone',
  desc: 'Set bot timezone for .time and .date — .settimezone Africa/Nairobi',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const tz = args.join(' ');
    if (!tz) {
      return reply(
        'Usage: .settimezone <timezone>\n\n' +
        'Common zones:\n' +
        COMMON_ZONES.map(z => `• ${z}`).join('\n')
      );
    }
    // Validate timezone
    try {
      new Date().toLocaleString('en-US', { timeZone: tz });
    } catch {
      return reply(`❌ Invalid timezone: *${tz}*\n\nExample: .settimezone Africa/Nairobi`);
    }
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.timezone = tz;
    await dbSet(`settings:${userId}`, s);
    const now = new Date().toLocaleString('en-US', { timeZone: tz, timeStyle: 'short' });
    await reply(`🕐 *Timezone Set*\n\nZone: *${tz}*\nCurrent time: *${now}*`);
  },
};

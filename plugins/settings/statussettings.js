// plugins/settings/statussettings.js
import { dbGet } from '../../lib/database.js';

export default {
  command: 'statussettings',
  desc: 'View all status-related settings in one place',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s    = (await dbGet(`settings:${userId}`)) || {};
    const icon = (v) => v ? '✅ ON' : '❌ OFF';
    await reply(
      `┏▣ ◈ *STATUS SETTINGS* ◈\n` +
      `┃\n` +
      `┃ 👀 autoviewstatus   : ${icon(s.autoviewstatus)}\n` +
      `┃ 🔥 autoreactstatus  : ${icon(s.autoreactstatus)}\n` +
      `┃ 💾 autosavestatus   : ${icon(s.autosavestatus)}\n` +
      `┃ 🛡️  antideletestatus : ${icon(s.antideletestatus)}\n` +
      `┃ 😀 statusEmoji      : ${s.statusEmoji || '🔥'}\n` +
      `┃ ⏱️  statusDelay      : ${(s.statusDelay || 0) / 1000}s\n` +
      `┃\n` +
      `┗▣\n\n` +
      `_Use each command with on/off to toggle._`
    );
  },
};

// plugins/group/listactive.js
// Tracks who sent messages recently (via a simple in-memory map)

export const activityMap = new Map(); // jid → { num, name, count, last }

export function trackActivity(jid, senderNum, name) {
  const key     = `${jid}:${senderNum}`;
  const existing = activityMap.get(key) || { count: 0 };
  activityMap.set(key, { jid, num: senderNum, name, count: existing.count + 1, last: Date.now() });
}

export default {
  command: ['listactive', 'active'],
  desc: 'List the most active members in the last session',
  category: 'group',
  group: true,
  run: async ({ jid, reply }) => {
    const groupActivity = [...activityMap.entries()]
      .filter(([k]) => k.startsWith(jid))
      .map(([, v]) => v)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    if (!groupActivity.length)
      return reply(
        '📊 No activity data yet.\n\n' +
        '_Members\' activity is tracked from the moment this feature is active._'
      );

    let text = `📊 *Most Active Members*\n${'─'.repeat(26)}\n\n`;
    groupActivity.forEach((m, i) => {
      text += `${i + 1}. ${m.name || m.num} — *${m.count}* messages\n`;
    });
    await reply(text);
  },
};

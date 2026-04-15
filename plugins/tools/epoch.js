// plugins/tools/epoch.js
export default {
  command: ['epoch', 'timestamp', 'unixtime'],
  desc: 'Convert Unix timestamp ↔ human date — .epoch  or  .epoch 1700000000',
  category: 'tools',
  run: async ({ args, reply }) => {
    const input = args[0];
    if (!input) {
      const now = Date.now();
      await reply(
        `⏱️ *Current Unix Timestamp*\n\n` +
        `Milliseconds : \`${now}\`\n` +
        `Seconds      : \`${Math.floor(now / 1000)}\`\n` +
        `Human Date   : ${new Date().toUTCString()}`
      );
      return;
    }
    const num = parseInt(input);
    if (isNaN(num)) return reply('❌ Invalid timestamp.\nExample: .epoch 1700000000');
    // Auto-detect seconds vs milliseconds
    const ms   = num > 1e12 ? num : num * 1000;
    const date = new Date(ms);
    if (isNaN(date)) return reply('❌ Invalid timestamp.');
    await reply(
      `⏱️ *Timestamp Converter*\n\n` +
      `Unix (s)  : \`${Math.floor(ms / 1000)}\`\n` +
      `Unix (ms) : \`${ms}\`\n` +
      `UTC       : ${date.toUTCString()}\n` +
      `ISO 8601  : ${date.toISOString()}\n` +
      `Relative  : ${timeAgo(ms)}`
    );
  },
};

function timeAgo(ms) {
  const diff = Date.now() - ms;
  const abs  = Math.abs(diff);
  const future = diff < 0;
  if (abs < 60000)    return future ? 'in a moment' : 'just now';
  if (abs < 3600000)  return `${future ? 'in ' : ''}${Math.round(abs/60000)} min${future ? '' : ' ago'}`;
  if (abs < 86400000) return `${future ? 'in ' : ''}${Math.round(abs/3600000)} hr${future ? '' : ' ago'}`;
  return `${future ? 'in ' : ''}${Math.round(abs/86400000)} day${future ? '' : 's ago'}`;
}

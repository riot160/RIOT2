// plugins/tools/speedread.js
export default {
  command: ['speedread', 'readtime', 'howlongtoread'],
  desc: 'Estimate reading time of any text — .speedread <text>  or reply to message',
  category: 'tools',
  run: async ({ text, msg, reply }) => {
    const q       = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const content = text || q?.conversation || q?.extendedTextMessage?.text || '';
    if (!content) return reply('Usage: .speedread <text>  or reply to any long message');
    const words  = content.trim().split(/\s+/).filter(Boolean).length;
    const slow   = Math.ceil(words / 150);   // 150 wpm (slow reader)
    const avg    = Math.ceil(words / 250);   // 250 wpm (average)
    const fast   = Math.ceil(words / 400);   // 400 wpm (fast reader)
    const fmt    = (m) => m < 1 ? 'under 1 min' : `${m} min`;
    await reply(
      `📖 *Reading Time Estimator*\n\n` +
      `📝 Words      : ${words.toLocaleString()}\n` +
      `${'─'.repeat(26)}\n` +
      `🐢 Slow (150 wpm)  : ${fmt(slow)}\n` +
      `👤 Average (250 wpm): ${fmt(avg)}\n` +
      `⚡ Fast (400 wpm)   : ${fmt(fast)}`
    );
  },
};

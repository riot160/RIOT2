// plugins/tools/reverse.js
export default {
  command: ['reverse', 'rev'],
  desc: 'Reverse any text — .reverse Hello World',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .reverse <text>\nExample: .reverse Hello World');
    await reply(`🔄 *Reversed*\n\n${[...text].reverse().join('')}`);
  },
};

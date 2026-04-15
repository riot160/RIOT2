// plugins/fun/pick.js
export default {
  command: ['pick', 'choose', 'decide'],
  desc: 'Let the bot pick for you — .pick pizza, burger, tacos',
  category: 'fun',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .pick <option1>, <option2>, <option3>…\nExample: .pick pizza, burger, tacos');
    const options = text.split(',').map(s => s.trim()).filter(Boolean);
    if (options.length < 2) return reply('❌ Give at least 2 options separated by commas.');
    const chosen = options[Math.floor(Math.random() * options.length)];
    await reply(`🎯 *The bot picks:*\n\n✅ *${chosen}*\n\n_From: ${options.join(' · ')}_`);
  },
};

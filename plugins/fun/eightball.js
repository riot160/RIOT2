// plugins/fun/eightball.js
const ANSWERS = [
  '✅ It is certain', '✅ Without a doubt', '✅ Yes, definitely',
  '✅ You may rely on it', '⚠️ Ask again later', '⚠️ Cannot predict now',
  '❌ Don\'t count on it', '❌ My reply is no', '❌ Very doubtful',
];

export default {
  command: ['8ball', 'magic'],
  desc: 'Ask the magic 8-ball a yes/no question',
  category: 'fun',
  run: async ({ text, reply }) => {
    if (!text) return reply('Ask a yes/no question: .8ball Will I be rich?');
    const ans = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    await reply(`🎱 *8-Ball*\n\n_"${text}"_\n\n*${ans}*`);
  },
};

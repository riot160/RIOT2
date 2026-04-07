// plugins/fun/quote.js
const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Life is what happens when you're busy making other plans. — John Lennon",
  "Spread love everywhere you go. — Mother Teresa",
  "Be yourself; everyone else is already taken. — Oscar Wilde",
  "In the middle of every difficulty lies opportunity. — Albert Einstein",
  "You miss 100% of the shots you don't take. — Wayne Gretzky",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
];

export default {
  command: ['quote', 'inspire'],
  desc: 'Get an inspirational quote',
  category: 'fun',
  run: async ({ reply }) => {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    await reply(`💭 *Quote of the Moment*\n\n_${q}_`);
  },
};

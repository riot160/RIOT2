// plugins/fun/joke.js
const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything! 😂",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "What do you call a fake noodle? An impasta!",
  "Why did the scarecrow win an award? He was outstanding in his field!",
  "I'm reading a book about anti-gravity. It's impossible to put down.",
  "Did you hear about the mathematician afraid of negative numbers? He'll stop at nothing to avoid them.",
  "What do you call cheese that isn't yours? Nacho cheese!",
  "Why can't you give Elsa a balloon? Because she'll let it go.",
];

export default {
  command: 'joke',
  desc: 'Get a random joke',
  category: 'fun',
  run: async ({ reply }) => {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    await reply(`😂 *Random Joke*\n\n${joke}`);
  },
};

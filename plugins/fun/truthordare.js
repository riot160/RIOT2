// plugins/fun/truthordare.js
const TRUTHS = [
  'What is your biggest fear?',
  'Have you ever lied to a best friend?',
  'What is your most embarrassing moment?',
  'Who is your secret crush?',
  "What's your worst habit?",
  'Have you ever cheated on a test?',
  "What's the biggest mistake you've made?",
  'Have you ever stolen anything?',
  'What is something nobody knows about you?',
  "What's the most childish thing you still do?",
];
const DARES = [
  'Send a voice note singing a song 🎵',
  'Change your profile picture for 24 hours 📸',
  'Do 10 push-ups right now 💪',
  'Speak in rhymes for the next 5 messages 🎤',
  'Write a love poem in 2 minutes ❤️',
  'Text your crush "hello" right now 😏',
  "Post 'I love carrots' as your status for 1 hour 🥕",
  'Send a funny selfie 🤳',
  'Make an animal sound in a voice note 🐾',
  'Describe yourself using only emojis 😂',
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  command: ['truthordare', 'tod'],
  desc: 'Get a random truth or dare challenge — .truthordare',
  category: 'fun',
  run: async ({ reply }) => {
    const isTruth = Math.random() < 0.5;
    await reply(
      isTruth
        ? `🙈 *TRUTH*\n\n${rand(TRUTHS)}`
        : `🔥 *DARE*\n\n${rand(DARES)}`
    );
  },
};

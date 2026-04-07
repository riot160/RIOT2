// plugins/fun/dare.js
const DARES = [
  "Send a voice note singing a song",
  "Change your profile picture for 24 hours",
  "Do 10 push-ups right now",
  "Speak in rhymes for the next 5 messages",
  "Send a funny selfie",
  "Write a love poem in 2 minutes",
  "Text your crush hello right now",
  "Walk around for 1 minute making animal sounds",
  "Tell a joke in another language",
  "Post 'I love carrots' as your status for 1 hour",
];

export default {
  command: 'dare',
  desc: 'Get a dare challenge for truth-or-dare',
  category: 'fun',
  run: async ({ reply }) => {
    const d = DARES[Math.floor(Math.random() * DARES.length)];
    await reply(`🔥 *DARE*\n\n${d}`);
  },
};

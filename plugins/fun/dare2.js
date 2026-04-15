// plugins/fun/dare2.js
const DARES = [
  'Do 20 jumping jacks right now and send a voice note while doing it 💪',
  'Send a voice note saying "I am a potato" in the most dramatic voice possible 🥔',
  'Text the last person you called and say "Did you feel that earthquake?" 😂',
  'Change your WhatsApp status to "I am a bot" for 1 hour 🤖',
  'Do your best celebrity impression in a voice note 🎤',
  'Send a GIF of a dancing banana in every group you\'re in 🍌',
  'Write a 3-sentence love story about a chair and a table ❤️',
  'Send a voice note counting to 30 as fast as possible ⏱️',
  'Change your profile picture to a potato for 2 hours 🥔',
  'Send a voice note singing happy birthday to nobody 🎂',
  'Type the alphabet backwards — GO! ⬅️',
  'Describe yourself using only food emojis 🍕🌮',
  'Send a voice note speaking like a robot for 20 seconds 🤖',
  'Write a 10-word poem about your phone right now 📱',
];
export default {
  command: 'dare2',
  desc: 'Get an extreme dare challenge — .dare2',
  category: 'fun',
  run: async ({ reply }) => {
    const d = DARES[Math.floor(Math.random() * DARES.length)];
    await reply(`🔥 *EXTREME DARE*\n\n${d}\n\n_No backing out! 😈_`);
  },
};

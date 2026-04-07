// plugins/tools/compliment.js
const COMPLIMENTS = [
  "You make the world a better place just by being in it. 🌟",
  "Your smile could light up the whole city! 😊",
  "You have the energy of someone who drinks tea and minds their business. Respect. 🍵",
  "You're one of the rare people who can actually be friends with anyone.",
  "The way your brain works is genuinely impressive. 🧠",
  "You're not just smart, you're wise. There's a big difference.",
  "People are lucky to have you in their lives, even if they don't say it enough.",
  "You handle hard things with grace. That's a real superpower.",
  "Your taste in music/movies/bots (especially this one 😉) is *chef's kiss*.",
  "You're the kind of person that makes other people want to be better.",
];

export default {
  command: ['compliment', 'hype'],
  desc: 'Give someone (or yourself) a compliment — .compliment @user',
  category: 'tools',
  run: async ({ msg, sock, jid, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const comp      = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    if (mentioned.length) {
      const name = `@${mentioned[0].split('@')[0]}`;
      await sock.sendMessage(jid, {
        text: `💐 *Compliment for ${name}*\n\n${comp}`,
        mentions: mentioned,
      });
    } else {
      await reply(`💐 *Compliment*\n\n${comp}`);
    }
  },
};

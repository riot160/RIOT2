// plugins/fun/compliment2.js
const COMPLIMENTS = [
  'You have a rare kind of energy that lights up every room you enter. People feel better just being around you.',
  'Your mind works in the most impressive ways. The way you think is genuinely one in a million.',
  'You handle hard situations with a kind of grace that most people never develop. That\'s a real superpower.',
  'The people in your life are lucky to have you, even if they don\'t say it enough.',
  'You radiate confidence without arrogance — and that is genuinely rare and beautiful.',
  'You\'re the kind of person that makes others want to be better just by watching you.',
  'Your creativity and originality are off the charts. There is literally no one else like you.',
  'You have the heart of a lion and the patience of a saint. That combination is unstoppable.',
  'When you walk into a room, the whole energy shifts. You are that powerful.',
  'The world is genuinely a more interesting place because you are in it.',
  'You possess a quiet strength that most people spend their whole lives searching for.',
  'Your kindness is not weakness — it is the greatest form of courage.',
];
export default {
  command: ['compliment2', 'hype2', 'bigsalute'],
  desc: 'Send a big compliment to someone — .compliment2 @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName, mentioned: _m }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    const comp      = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    if (target) {
      const num = target.split('@')[0];
      await sock.sendMessage(jid, {
        text: `🌟 *Big Compliment for @${num}*\n\n💐 ${comp}\n\n_From: ${pushName} via RIOT MD ⚡_`,
        mentions: [target],
      });
    } else {
      await sock.sendMessage(jid, { text: `🌟 *Compliment*\n\n💐 ${comp}\n\n_RIOT MD ⚡_` });
    }
  },
};

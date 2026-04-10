// plugins/fun/xxqc.js
// Fun rating command — gives a humorous random score

const COMMENTS = {
  range: [
    [0,  2,  ['Absolutely terrible 😭', 'Needs serious work 💀', 'Yikes... 😬']],
    [3,  4,  ['Below average 😕', 'Could be better 🤷', 'Room for improvement 📈']],
    [5,  6,  ['Average at best 😐', 'Mid, not gonna lie 😶', 'Mediocre vibes 🌊']],
    [7,  8,  ['Pretty solid! 👍', 'Not bad at all 😊', 'Above average 🔥']],
    [9,  9,  ['Almost perfect! ⭐', 'Impressive stuff 🌟', 'Very strong showing 💪']],
    [10, 10, ['PERFECT SCORE! 🏆', 'Absolutely flawless! 👑', '10/10 no notes! ✨']],
  ],
};

function getComment(score) {
  for (const [min, max, msgs] of COMMENTS.range) {
    if (score >= min && score <= max) {
      return msgs[Math.floor(Math.random() * msgs.length)];
    }
  }
  return '?';
}

export default {
  command: ['xxqc', 'rate', 'ratemyself'],
  desc: 'Get a fun random rating — .xxqc @user  or  .xxqc <anything>',
  category: 'fun',
  run: async ({ sock, msg, jid, text, args, senderNumber, pushName, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const score     = Math.floor(Math.random() * 11); // 0–10
    const bar       = '█'.repeat(score) + '░'.repeat(10 - score);
    const comment   = getComment(score);

    if (mentioned.length) {
      const num  = mentioned[0].split('@')[0];
      const name = `@${num}`;
      await sock.sendMessage(jid, {
        text:
          `📊 *RIOT MD Rating*\n\n` +
          `👤 Subject : ${name}\n` +
          `[${bar}] ${score}/10\n\n` +
          `💬 ${comment}`,
        mentions: mentioned,
      });
    } else {
      const subject = text || pushName;
      await reply(
        `📊 *RIOT MD Rating*\n\n` +
        `👤 Subject : ${subject}\n` +
        `[${bar}] ${score}/10\n\n` +
        `💬 ${comment}`
      );
    }
  },
};

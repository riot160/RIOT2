// plugins/fun/love.js
export default {
  command: ['love', 'lovecalc', 'compatibility'],
  desc: 'Fun love compatibility calculator — .love Alice Bob',
  category: 'fun',
  run: async ({ args, sock, jid, msg, reply }) => {
    const name1 = args[0];
    const name2 = args[1];
    if (!name1 || !name2)
      return reply('Usage: .love <name1> <name2>\nExample: .love Alice Bob');
    // Deterministic score based on names so same pair always gets same result
    const seed  = [...(name1 + name2).toLowerCase()].reduce((a, c) => a + c.charCodeAt(0), 0);
    const score = (seed % 41) + 60; // 60–100
    const bar   = '❤️'.repeat(Math.round(score / 10)) + '🖤'.repeat(10 - Math.round(score / 10));
    const msg2  = score >= 90 ? 'Perfect match! 💍'
                : score >= 75 ? 'Great chemistry! 💕'
                : score >= 60 ? 'Pretty good! 💞'
                :               'Keep trying! 💔';
    await sock.sendMessage(jid, {
      text:
        `💘 *Love Calculator*\n\n` +
        `👤 ${name1}  ×  ${name2} 👤\n\n` +
        `${bar}\n\n` +
        `❤️ Score : *${score}%*\n` +
        `💬 ${msg2}`,
    }, { quoted: msg });
  },
};

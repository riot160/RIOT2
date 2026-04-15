// plugins/fun/iq.js
export default {
  command: ['iq', 'myiq', 'iqtest'],
  desc: 'Get a fun AI-estimated IQ score — .iq  or .iq @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName, senderNumber }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    const num       = target ? target.split('@')[0] : senderNumber;
    const name      = target ? `@${num}` : pushName;
    // Deterministic but looks random
    const seed  = [...num].reduce((a, c) => a + c.charCodeAt(0), 0);
    const iq    = (seed % 91) + 70; // 70–160
    const bar   = '█'.repeat(Math.round((iq - 70) / 9)) + '░'.repeat(10 - Math.round((iq - 70) / 9));
    const label = iq >= 145 ? '🧠 Genius level!'
                : iq >= 130 ? '🎓 Highly gifted'
                : iq >= 115 ? '⭐ Above average'
                : iq >= 100 ? '✅ Average'
                : iq >= 85  ? '📚 Below average'
                :              '😅 Unique thinker';
    const text =
      `🧠 *IQ Test Result*\n\n` +
      `👤 Subject : ${name}\n` +
      `[${bar}]\n` +
      `📊 IQ Score: *${iq}*\n` +
      `${label}\n\n` +
      `_Results are for fun only! 😄_`;
    await sock.sendMessage(jid, {
      text, mentions: target ? [target] : [],
    });
  },
};

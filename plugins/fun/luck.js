// plugins/fun/luck.js
const MESSAGES = {
  high: ['Today is your day! 🌟 Everything you touch turns to gold.',
         'Fortune smiles on you today! 🍀 Take bold steps.',
         'Your lucky streak is unstoppable! ⚡ Go get it!'],
  mid:  ['A balanced day ahead. ⚖️ Good things come to those who wait.',
         'Mixed energy today — trust your gut! 🎯',
         'Average luck, but your effort makes the difference! 💪'],
  low:  ['Stay cautious today 🌧️ — patience is your superpower.',
         'Not the best day for big decisions. Rest and recharge! 🔋',
         'Challenges today build tomorrow\'s strength. 💎'],
};
export default {
  command: ['luck', 'dailyluck', 'fortunetoday'],
  desc: 'Get your daily luck score — .luck  or  .luck @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName, senderNumber }) => {
    const mentioned = msg.message?.extendedTextElement?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    const num       = target ? target.split('@')[0] : senderNumber;
    const name      = target ? `@${num}` : pushName;
    // Change daily (same score all day for same person)
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seed  = [...(num + today)].reduce((a, c) => a + c.charCodeAt(0), 0);
    const score = (seed % 91) + 10; // 10–100
    const bar   = '🍀'.repeat(Math.round(score / 20)) + '🍂'.repeat(5 - Math.round(score / 20));
    const tier  = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';
    const msgs  = MESSAGES[tier];
    const msg2  = msgs[seed % msgs.length];
    await sock.sendMessage(jid, {
      text:
        `🍀 *Daily Luck Score*\n\n` +
        `👤 ${name}\n` +
        `📅 ${new Date().toDateString()}\n\n` +
        `${bar}\n` +
        `⭐ Score : *${score}/100*\n\n` +
        `💬 ${msg2}`,
      mentions: target ? [target] : [],
    });
  },
};

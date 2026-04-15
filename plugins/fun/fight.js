// plugins/fun/fight.js
const MOVES = ['🥊 jabs','🦵 kicks','🤼 tackles','⚔️ challenges','💥 attacks',
  '🏏 bats','🌪️ spin-kicks','💢 challenges to a duel'];
export default {
  command: ['fight', 'battle'],
  desc: 'Challenge someone to a fight — .fight @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    if (!target) { await sock.sendMessage(jid, { text: 'Mention someone! .fight @user' }); return; }
    const num  = target.split('@')[0];
    const move = MOVES[Math.floor(Math.random() * MOVES.length)];
    const hp1  = Math.floor(Math.random() * 60) + 40;
    const hp2  = Math.floor(Math.random() * 60) + 40;
    const winner = hp1 > hp2 ? pushName : `@${num}`;
    await sock.sendMessage(jid, {
      text:
        `⚔️ *FIGHT!*\n\n` +
        `*${pushName}* ${move} *@${num}*!\n\n` +
        `💪 ${pushName} HP: ${hp1}\n` +
        `💪 @${num} HP: ${hp2}\n\n` +
        `🏆 Winner: *${winner}*!`,
      mentions: [target],
    });
  },
};

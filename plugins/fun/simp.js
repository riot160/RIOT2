// plugins/fun/simp.js
export default {
  command: ['simp','simprate'],
  desc: 'Rate how much of a simp you are — .simp @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    const score     = Math.floor(Math.random() * 101);
    const bar       = '🩷'.repeat(Math.round(score/10)) + '🖤'.repeat(10 - Math.round(score/10));
    const verdict   = score >= 90 ? '💀 Certified Mega-Simp!' : score >= 70 ? '😳 High-key simping' : score >= 50 ? '😅 Mid-level simp' : score >= 30 ? '😐 Low key simp' : '😎 Not a simp';
    if (target) {
      await sock.sendMessage(jid, {
        text: `💕 *Simp Detector*\n\n@${target.split('@')[0]}\n\n${bar}\n\n💯 Simp Level: *${score}%*\n${verdict}`,
        mentions: [target],
      });
    } else {
      await sock.sendMessage(jid, {
        text: `💕 *Simp Detector*\n\n${pushName}\n\n${bar}\n\n💯 Simp Level: *${score}%*\n${verdict}`,
      });
    }
  },
};

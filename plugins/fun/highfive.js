// plugins/fun/highfive.js
export default {
  command: ['highfive', 'hi5'],
  desc: 'Give someone a high five — .highfive @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    if (!target) { await sock.sendMessage(jid, { text: 'Mention someone! .highfive @user' }); return; }
    const num = target.split('@')[0];
    await sock.sendMessage(jid, { text: `🙌 *${pushName}* gives *@${num}* an epic HIGH FIVE! ✋`, mentions: [target] });
  },
};

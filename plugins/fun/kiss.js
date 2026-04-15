// plugins/fun/kiss.js
const KISSES = [
  'blows a kiss to {user} 💋',
  'gives {user} a quick kiss on the cheek 😘',
  'sends {user} a big virtual kiss 💕',
  'pecks {user} on the forehead 🥰',
];
export default {
  command: ['kiss', 'smooch'],
  desc: 'Kiss someone — .kiss @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    if (!target) { await sock.sendMessage(jid, { text: 'Mention someone! .kiss @user' }); return; }
    const num    = target.split('@')[0];
    const action = KISSES[Math.floor(Math.random() * KISSES.length)].replace('{user}', `@${num}`);
    await sock.sendMessage(jid, { text: `😘 *${pushName} ${action}*`, mentions: [target] });
  },
};

// plugins/fun/hug.js
const HUGS = [
  'gives {user} a warm bear hug 🐻',
  'hugs {user} tightly and won\'t let go 🤗',
  'wraps {user} in the biggest hug ever 💕',
  'gives {user} a surprise hug from behind 😊',
  'hugs {user} like they haven\'t seen them in years 🥰',
];
export default {
  command: ['hug', 'cuddle'],
  desc: 'Hug someone — .hug @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    if (!target) { await sock.sendMessage(jid, { text: 'Mention someone to hug! .hug @user' }); return; }
    const num    = target.split('@')[0];
    const action = HUGS[Math.floor(Math.random() * HUGS.length)].replace('{user}', `@${num}`);
    await sock.sendMessage(jid, { text: `🤗 *${pushName} ${action}*`, mentions: [target] });
  },
};

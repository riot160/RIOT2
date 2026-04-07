// plugins/tools/roast.js
import fetch from 'node-fetch';

const ROASTS = [
  "You're the reason they put instructions on shampoo bottles.",
  "You're not stupid, you just have bad luck thinking.",
  "I'd agree with you but then we'd both be wrong.",
  "You're like a software update — whenever I see you, I think 'not now'.",
  "I've met some pebbles with sharper edges than your wit.",
  "You're like a cloud — when you disappear, it's a beautiful day.",
  "You bring everyone so much joy — when you leave the room.",
  "Somewhere out there, a tree is producing oxygen for you. That tree owes everyone an apology.",
  "You're proof that even evolution makes mistakes sometimes.",
  "If brains were petrol, you wouldn't have enough to power a fly's go-kart.",
];

export default {
  command: ['roast', 'insult'],
  desc: 'Get a funny roast for laughs — .roast @user',
  category: 'tools',
  run: async ({ msg, sock, jid, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const roast     = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    if (mentioned.length) {
      const name = `@${mentioned[0].split('@')[0]}`;
      await sock.sendMessage(jid, {
        text: `🔥 *Roast for ${name}*\n\n${roast}`,
        mentions: mentioned,
      });
    } else {
      await reply(`🔥 *Roast*\n\n${roast}`);
    }
  },
};

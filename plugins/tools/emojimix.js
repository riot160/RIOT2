// plugins/tools/emojimix.js
import fetch from 'node-fetch';

export default {
  command: ['emojimix', 'mixemoji', 'emoji'],
  desc: 'Mix two emojis together — .emojimix 😂 🔥',
  category: 'tools',
  run: async ({ args, sock, jid, msg, reply }) => {
    const e1 = args[0];
    const e2 = args[1];
    if (!e1 || !e2)
      return reply('Usage: .emojimix <emoji1> <emoji2>\nExample: .emojimix 😂 🔥');

    const toCodepoint = (emoji) => {
      const cp = emoji.codePointAt(0)?.toString(16);
      return cp || null;
    };

    const cp1 = toCodepoint(e1);
    const cp2 = toCodepoint(e2);
    if (!cp1 || !cp2)
      return reply('❌ Please use actual emojis.\nExample: .emojimix 😂 🔥');

    // Google's Emoji Kitchen API
    const url = `https://www.gstatic.com/android/keyboard/emojikitchen/20230301/u${cp1}/u${cp1}_u${cp2}.png`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Mix not available');
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(jid,
        { image: buf, caption: `${e1} + ${e2} = 🎨` },
        { quoted: msg }
      );
    } catch {
      // Try reversed
      const url2 = `https://www.gstatic.com/android/keyboard/emojikitchen/20230301/u${cp2}/u${cp2}_u${cp1}.png`;
      try {
        const res2 = await fetch(url2);
        if (!res2.ok) throw new Error('Not available');
        const buf2 = Buffer.from(await res2.arrayBuffer());
        await sock.sendMessage(jid,
          { image: buf2, caption: `${e1} + ${e2} = 🎨` },
          { quoted: msg }
        );
      } catch {
        await reply(`❌ This emoji combination is not available.\nTry different emojis.`);
      }
    }
  },
};

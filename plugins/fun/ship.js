// plugins/fun/ship.js
export default {
  command: ['ship', 'couple'],
  desc: 'Ship two people together — .ship Alice Bob',
  category: 'fun',
  run: async ({ args, reply }) => {
    const n1 = args[0], n2 = args[1];
    if (!n1 || !n2) return reply('Usage: .ship <name1> <name2>');
    const shipName = n1.slice(0, Math.ceil(n1.length/2)) + n2.slice(Math.floor(n2.length/2));
    const score    = ((n1.length + n2.length) * 7) % 41 + 60;
    await reply(`💑 *Ship Name:* *${shipName}*\n\n❤️ Match: ${score}%\n\n_${n1} + ${n2} = 💕_`);
  },
};

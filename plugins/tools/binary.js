// plugins/tools/binary.js
export default {
  command: ['binary', 'bin'],
  desc: 'Convert text ↔ binary — .binary encode Hello  |  .binary decode 01001000...',
  category: 'tools',
  run: async ({ args, reply }) => {
    const mode  = args[0]?.toLowerCase();
    const input = args.slice(1).join(' ');
    if (!mode || !input)
      return reply('Usage:\n.binary encode <text>\n.binary decode <binary>');

    if (mode === 'encode') {
      const result = input.split('').map(c =>
        c.charCodeAt(0).toString(2).padStart(8, '0')
      ).join(' ');
      await reply(`💾 *Binary Encoded*\n\n${result}`);

    } else if (mode === 'decode') {
      try {
        const result = input.split(' ').map(b =>
          String.fromCharCode(parseInt(b, 2))
        ).join('');
        await reply(`💬 *Binary Decoded*\n\n${result}`);
      } catch {
        await reply('❌ Invalid binary string. Make sure it is 8-bit groups separated by spaces.');
      }
    } else {
      await reply('Mode must be *encode* or *decode*.\n.binary encode Hello\n.binary decode 01001000');
    }
  },
};

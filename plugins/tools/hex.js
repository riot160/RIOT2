// plugins/tools/hex.js
export default {
  command: ['hex', 'tohex', 'fromhex'],
  desc: 'Convert text to/from hex — .hex encode hello  |  .hex decode 68656c6c6f',
  category: 'tools',
  run: async ({ args, reply }) => {
    const mode  = args[0]?.toLowerCase();
    const input = args.slice(1).join(' ');
    if (!mode || !input)
      return reply('Usage:\n.hex encode <text>\n.hex decode <hex string>');
    if (mode === 'encode') {
      const hex = Buffer.from(input, 'utf8').toString('hex');
      await reply(`🔷 *Hex Encoded*\n\n\`${hex}\``);
    } else if (mode === 'decode') {
      try {
        const text = Buffer.from(input.replace(/\s/g,''), 'hex').toString('utf8');
        await reply(`🔷 *Hex Decoded*\n\n${text}`);
      } catch { await reply('❌ Invalid hex string.'); }
    } else {
      await reply('Mode must be *encode* or *decode*.');
    }
  },
};

// plugins/tools/obfuscate.js
export default {
  command: ['obfuscate', 'hide', 'hiddentext'],
  desc: 'Hide text in invisible characters or reveal hidden text — .obfuscate hide <text>',
  category: 'tools',
  run: async ({ args, reply }) => {
    const mode  = args[0]?.toLowerCase();
    const input = args.slice(1).join(' ');

    if (!mode || !input)
      return reply(
        '🔏 *Text Obfuscator*\n\n' +
        'Usage:\n' +
        '• .obfuscate hide <text>   — hide text\n' +
        '• .obfuscate reveal <text> — reveal hidden text\n\n' +
        'Example: .obfuscate hide Hello World'
      );

    if (mode === 'hide') {
      // Encode each char as zero-width characters
      const ZW_ZERO = '\u200B'; // zero-width space = 0
      const ZW_ONE  = '\u200C'; // zero-width non-joiner = 1
      const ZW_SEP  = '\u200D'; // zero-width joiner = separator
      let hidden = '';
      for (const c of input) {
        const bits = c.charCodeAt(0).toString(2).padStart(8, '0');
        hidden += bits.split('').map(b => b === '0' ? ZW_ZERO : ZW_ONE).join('') + ZW_SEP;
      }
      await reply(
        `🔏 *Text hidden below* (copy + paste it anywhere):\n\n` +
        `👻${hidden}👻\n\n` +
        `_Use .obfuscate reveal to decode_`
      );
    } else if (mode === 'reveal') {
      const ZW_ZERO = '\u200B';
      const ZW_ONE  = '\u200C';
      const ZW_SEP  = '\u200D';
      try {
        const chars = input.replace(/[^\u200B\u200C\u200D]/g, '');
        const words = chars.split(ZW_SEP).filter(Boolean);
        const text  = words.map(w => {
          const bits = w.split('').map(c => c === ZW_ZERO ? '0' : '1').join('');
          return String.fromCharCode(parseInt(bits, 2));
        }).join('');
        await reply(`🔓 *Revealed text:*\n\n${text}`);
      } catch {
        await reply('❌ No hidden text found. Make sure you copied the full text including the 👻 markers.');
      }
    } else {
      await reply('Mode must be *hide* or *reveal*.\nExample: .obfuscate hide Hello');
    }
  },
};

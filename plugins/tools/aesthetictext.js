// plugins/tools/aesthetictext.js
const STYLES = {
  vaporwave: t => [...t].map(c => c === ' ' ? '　' : String.fromCodePoint((c.codePointAt(0) >= 33 && c.codePointAt(0) <= 126) ? c.codePointAt(0) + 65248 : c.codePointAt(0))).join(''),
  strikethrough: t => [...t].map(c => c + '\u0336').join(''),
  underline:     t => [...t].map(c => c + '\u0332').join(''),
  double:        t => [...t].map(c => c + '\u030F').join(''),
  dots:          t => [...t].map(c => c + '\u0307').join(''),
};
export default {
  command: ['aesthetictext', 'atext', 'texteffect'],
  desc: 'Apply cool text effects — .atext vaporwave Hello',
  category: 'tools',
  run: async ({ args, reply }) => {
    const style = args[0]?.toLowerCase();
    const input = args.slice(1).join(' ');
    const names = Object.keys(STYLES);
    if (!style || !input || !STYLES[style])
      return reply(
        `✨ *Text Effects*\n\nUsage: .atext <style> <text>\n\nStyles:\n` +
        names.map(n => `• *${n}*  →  ${STYLES[n]('Hello')}`).join('\n')
      );
    await reply(`✨ *${style}*\n\n${STYLES[style](input)}`);
  },
};

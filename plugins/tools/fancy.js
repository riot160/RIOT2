// plugins/tools/fancy.js
const STYLES = {
  bold:       s => [...s].map(c => {
    const cp = c.codePointAt(0);
    if (cp >= 65 && cp <= 90)  return String.fromCodePoint(cp - 65 + 0x1D400);
    if (cp >= 97 && cp <= 122) return String.fromCodePoint(cp - 97 + 0x1D41A);
    if (cp >= 48 && cp <= 57)  return String.fromCodePoint(cp - 48 + 0x1D7CE);
    return c;
  }).join(''),
  italic:     s => [...s].map(c => {
    const cp = c.codePointAt(0);
    if (cp >= 65 && cp <= 90)  return String.fromCodePoint(cp - 65 + 0x1D434);
    if (cp >= 97 && cp <= 122) return String.fromCodePoint(cp - 97 + 0x1D44E);
    return c;
  }).join(''),
  mono:       s => [...s].map(c => {
    const cp = c.codePointAt(0);
    if (cp >= 65 && cp <= 90)  return String.fromCodePoint(cp - 65 + 0x1D670);
    if (cp >= 97 && cp <= 122) return String.fromCodePoint(cp - 97 + 0x1D68A);
    if (cp >= 48 && cp <= 57)  return String.fromCodePoint(cp - 48 + 0x1D7F6);
    return c;
  }).join(''),
  bubble:     s => [...s].map(c => {
    const cp = c.codePointAt(0);
    if (cp >= 65 && cp <= 90)  return String.fromCodePoint(cp - 65 + 0x24B6);
    if (cp >= 97 && cp <= 122) return String.fromCodePoint(cp - 97 + 0x24D0);
    if (cp >= 49 && cp <= 57)  return String.fromCodePoint(cp - 49 + 0x2460);
    if (cp === 48) return '⓪';
    return c;
  }).join(''),
  smallcaps:  s => [...s.toLowerCase()].map(c => {
    const MAP = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',
                 k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'q',r:'ʀ',s:'ꜱ',t:'ᴛ',
                 u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
    return MAP[c] || c;
  }).join(''),
  flip:       s => [...s].reverse().map(c => {
    const MAP = {a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',
                 k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',
                 u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z'};
    return MAP[c.toLowerCase()] || c;
  }).join(''),
};

export default {
  command: ['fancy', 'font'],
  desc: 'Convert text to fancy styles — .fancy bold Hello',
  category: 'tools',
  run: async ({ args, reply }) => {
    const style = args[0]?.toLowerCase();
    const input = args.slice(1).join(' ');
    const names = Object.keys(STYLES);

    if (!style || !input || !STYLES[style]) {
      return reply(
        `🔤 *Fancy Text Converter*\n\n` +
        `Usage: .fancy <style> <text>\n\n` +
        `Available styles:\n` +
        names.map(n => `• *${n}*  →  ${STYLES[n]('Hello')}`).join('\n')
      );
    }
    await reply(`🔤 *${style}*\n\n${STYLES[style](input)}`);
  },
};

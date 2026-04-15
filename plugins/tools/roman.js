// plugins/tools/roman.js
const VALUES = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
  [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];

function toRoman(n) {
  let result = '';
  for (const [val, sym] of VALUES) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

function fromRoman(s) {
  const MAP = {M:1000,D:500,C:100,L:50,X:10,V:5,I:1};
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur  = MAP[s[i]];
    const next = MAP[s[i+1]];
    if (next && next > cur) { result -= cur; } else { result += cur; }
  }
  return result;
}

export default {
  command: ['roman', 'toroman', 'fromroman'],
  desc: 'Convert number ↔ Roman numerals — .roman 2024  or  .roman MMXXIV',
  category: 'tools',
  run: async ({ args, reply }) => {
    const input = args[0];
    if (!input) return reply('Usage:\n.roman 2024       → MMXXIV\n.roman MMXXIV    → 2024');
    if (/^\d+$/.test(input)) {
      const n = parseInt(input);
      if (n < 1 || n > 3999) return reply('❌ Number must be between 1 and 3999.');
      await reply(`🏛️ *Roman Numerals*\n\n${n} = *${toRoman(n)}*`);
    } else {
      const cleaned = input.toUpperCase().replace(/[^MDCLXVI]/g, '');
      const n       = fromRoman(cleaned);
      await reply(`🏛️ *Roman Numerals*\n\n${cleaned} = *${n}*`);
    }
  },
};

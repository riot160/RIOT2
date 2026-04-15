// plugins/tools/numtowords.js
const ones = ['','one','two','three','four','five','six','seven','eight','nine',
  'ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

function convert(n) {
  if (n === 0) return 'zero';
  if (n < 0) return 'negative ' + convert(-n);
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? '-' + ones[n%10] : '');
  if (n < 1000) return ones[Math.floor(n/100)] + ' hundred' + (n%100 ? ' ' + convert(n%100) : '');
  if (n < 1e6) return convert(Math.floor(n/1000)) + ' thousand' + (n%1000 ? ' ' + convert(n%1000) : '');
  if (n < 1e9) return convert(Math.floor(n/1e6)) + ' million' + (n%1e6 ? ' ' + convert(n%1e6) : '');
  return convert(Math.floor(n/1e9)) + ' billion' + (n%1e9 ? ' ' + convert(n%1e9) : '');
}

export default {
  command: ['numtowords', 'n2w', 'numbertowords'],
  desc: 'Convert a number to words — .numtowords 12345',
  category: 'tools',
  run: async ({ args, reply }) => {
    const n = parseInt(args[0]);
    if (isNaN(n)) return reply('Usage: .numtowords <number>\nExample: .numtowords 12345');
    await reply(`🔢 *Number to Words*\n\n${n.toLocaleString()} = *${convert(n)}*`);
  },
};

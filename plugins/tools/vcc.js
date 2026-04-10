// plugins/tools/vcc.js
// Generates Luhn-valid FAKE card numbers for developers to test payment forms
// These are NOT real cards — they have no banking connection whatsoever

function luhn(partial) {
  const digits = [...partial].map(Number);
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - i) % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
}

function generateCard(prefix, length = 16) {
  let num = prefix;
  while (num.length < length - 1) num += Math.floor(Math.random() * 10);
  return num + luhn(num);
}

const BINS = {
  visa:       { prefix: '4', label: 'Visa' },
  mastercard: { prefix: '5' + (Math.floor(Math.random() * 5) + 1), label: 'Mastercard' },
  amex:       { prefix: '37', length: 15, label: 'Amex' },
  discover:   { prefix: '6011', label: 'Discover' },
};

export default {
  command: ['vcc', 'fakecard', 'testcard'],
  desc: 'Generate a FAKE test card number for developer testing — .vcc visa',
  category: 'tools',
  run: async ({ args, reply }) => {
    const type = args[0]?.toLowerCase() || 'visa';
    const bin  = BINS[type];
    if (!bin)
      return reply(
        'Usage: .vcc <type>\n\nTypes: visa · mastercard · amex · discover\n\n' +
        '⚠️ These are FAKE numbers for developer testing ONLY.\n' +
        'They are mathematically valid (Luhn) but NOT real cards.'
      );

    const { prefix, length = 16, label } = bin;
    const num   = generateCard(prefix, length);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const year  = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
    const cvv   = Array.from({ length: label === 'Amex' ? 4 : 3 }, () => Math.floor(Math.random() * 10)).join('');
    const fmt   = label === 'Amex'
      ? `${num.slice(0,4)} ${num.slice(4,10)} ${num.slice(10)}`
      : num.match(/.{4}/g).join(' ');

    await reply(
      `💳 *Test Card Generator*\n\n` +
      `🏦 Network : ${label}\n` +
      `🔢 Number  : \`${fmt}\`\n` +
      `📅 Expiry  : ${month}/${year}\n` +
      `🔒 CVV     : ${cvv}\n\n` +
      `⚠️ *FAKE CARD — For developer testing only.*\n` +
      `_Not a real card. Has no funds. Cannot be used for purchases._`
    );
  },
};

// plugins/tools/morse.js
const MORSE = {
  a:'.-', b:'-...', c:'-.-.', d:'-..', e:'.', f:'..-.', g:'--.', h:'....',
  i:'..', j:'.---', k:'-.-', l:'.-..', m:'--', n:'-.', o:'---', p:'.--.',
  q:'--.-', r:'.-.', s:'...', t:'-', u:'..-', v:'...-', w:'.--', x:'-..-',
  y:'-.--', z:'--..',
  '0':'-----', '1':'.----', '2':'..---', '3':'...--', '4':'....-',
  '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.',
  '.':'.-.-.-', ',':'--..--', '?':'..--..', '!':'-.-.--', ' ':'/',
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));

export default {
  command: ['morse'],
  desc: 'Convert text ↔ morse code — .morse encode SOS  |  .morse decode ... --- ...',
  category: 'tools',
  run: async ({ args, reply }) => {
    const mode  = args[0]?.toLowerCase();
    const input = args.slice(1).join(' ');
    if (!mode || !input)
      return reply('Usage:\n.morse encode <text>\n.morse decode <morse>');

    if (mode === 'encode') {
      const result = input.toLowerCase().split('').map(c => MORSE[c] || '?').join(' ');
      await reply(`📡 *Morse Encoded*\n\n${result}`);
    } else if (mode === 'decode') {
      const result = input.split(' ').map(c => MORSE_REV[c] || '?').join('');
      await reply(`📡 *Morse Decoded*\n\n${result.toUpperCase()}`);
    } else {
      await reply('Mode must be *encode* or *decode*.');
    }
  },
};

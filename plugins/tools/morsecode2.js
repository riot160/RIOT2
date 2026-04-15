// plugins/tools/morsecode2.js
const MORSE = {
  a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',
  i:'..',j:'.---',k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',
  q:'--.-',r:'.-.',s:'...',t:'-',u:'..-',v:'...-',w:'.--',x:'-..-',
  y:'-.--',z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  ' ':'/'
};
export default {
  command: ['morsecode2', 'morse2'],
  desc: 'Convert text to morse with audio dots/dashes — .morsecode2 SOS',
  category: 'tools',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .morsecode2 <text>\nExample: .morsecode2 SOS\n.morsecode2 RIOT MD');
    const encoded = text.toLowerCase().split('').map(c => MORSE[c] || '?').join(' ');
    const visual  = encoded.replace(/\./g, '•').replace(/-/g, '─').replace(/\//g, ' | ');
    await reply(
      `📡 *Morse Code*\n\n` +
      `📝 Text  : ${text.toUpperCase()}\n` +
      `📡 Morse : \`${encoded}\`\n` +
      `👁️  Visual: ${visual}\n\n` +
      `• = dot (dit)  ─ = dash (dah)  | = word space`
    );
  },
};

// plugins/tools/fliptext.js
const FLIP_MAP = {
  a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',
  k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',
  u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z',
  A:'∀',B:'ᗺ',C:'Ɔ',D:'ᗡ',E:'Ǝ',F:'ᖵ',G:'פ',H:'H',I:'I',J:'ᒋ',
  K:'ʞ',L:'˥',M:'W',N:'N',O:'O',P:'Ԁ',Q:'Q',R:'ᴚ',S:'S',T:'┴',
  U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z',
  '0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6',
  '.':'˙',',':'\'','!':'¡','?':'¿','(':')',')':'(',
  '[':']',']':'[','{':'}','}':'{','<':'>','>':'<',
};

export default {
  command: ['fliptext', 'upsidedown'],
  desc: 'Flip text upside down — .fliptext Hello',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .fliptext <text>\nExample: .fliptext Hello World');
    const flipped = [...text].reverse().map(c => FLIP_MAP[c] || c).join('');
    await reply(`🙃 *Flipped Text*\n\n${flipped}`);
  },
};

// plugins/tools/phonetics.js
const NATO = {
  a:'Alpha',b:'Bravo',c:'Charlie',d:'Delta',e:'Echo',f:'Foxtrot',
  g:'Golf',h:'Hotel',i:'India',j:'Juliet',k:'Kilo',l:'Lima',
  m:'Mike',n:'November',o:'Oscar',p:'Papa',q:'Quebec',r:'Romeo',
  s:'Sierra',t:'Tango',u:'Uniform',v:'Victor',w:'Whiskey',
  x:'X-ray',y:'Yankee',z:'Zulu',
  '0':'Zero','1':'One','2':'Two','3':'Three','4':'Four',
  '5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine',
};
export default {
  command: ['phonetics', 'nato', 'phonetic'],
  desc: 'Convert text to NATO phonetic alphabet — .phonetics RIOT',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .phonetics <text>\nExample: .phonetics RIOT MD\n.phonetics A2K');
    const result = text.toUpperCase().split('').map(c => {
      const p = NATO[c.toLowerCase()];
      return p ? `${c} — ${p}` : c === ' ' ? '' : `${c} — ?`;
    }).filter(Boolean).join('\n');
    await reply(`📻 *NATO Phonetic Alphabet*\n\n${result}`);
  },
};

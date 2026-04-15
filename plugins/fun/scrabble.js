// plugins/fun/scrabble.js
const SCORES = {
  a:1,e:1,i:1,o:1,u:1,l:1,n:1,s:1,t:1,r:1,
  d:2,g:2,b:3,c:3,m:3,p:3,f:4,h:4,v:4,w:4,y:4,
  k:5,j:8,x:8,q:10,z:10
};
export default {
  command: ['scrabble', 'wordvalue', 'letterscore'],
  desc: 'Calculate Scrabble score of a word — .scrabble quartz',
  category: 'fun',
  run: async ({ args, reply }) => {
    const word = (args[0] || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return reply('Usage: .scrabble <word>\nExample: .scrabble quartz');
    const breakdown = [...word].map(l => `${l.toUpperCase()}(${SCORES[l] || 0})`).join(' + ');
    const score     = [...word].reduce((sum, l) => sum + (SCORES[l] || 0), 0);
    await reply(
      `🎲 *Scrabble Score: "${word.toUpperCase()}"*\n\n` +
      `${breakdown}\n\n` +
      `🏆 Total Score: *${score} points*`
    );
  },
};

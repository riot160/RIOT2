// plugins/fun/emojitest.js
const ROUNDS = [
  { emoji:'🦁👑🌍',     answer:'the lion king',    hint:'Disney animated classic' },
  { emoji:'🕷️👨🏙️',     answer:'spiderman',        hint:'Marvel superhero' },
  { emoji:'🧊❄️👸',     answer:'frozen',            hint:'Disney princess movie' },
  { emoji:'🚀🌌👨‍🚀',     answer:'interstellar',     hint:'Christopher Nolan space film' },
  { emoji:'⚡🧙🏰',     answer:'harry potter',     hint:'Wizarding world' },
  { emoji:'💍🧙🗻',     answer:'lord of the rings', hint:'Fantasy epic' },
  { emoji:'🦈🌊😱',     answer:'jaws',              hint:'Spielberg shark film' },
  { emoji:'🦖🌴🧪',     answer:'jurassic park',    hint:'Dinosaur theme park' },
  { emoji:'👻🏚️📷',     answer:'paranormal activity', hint:'Found footage horror' },
  { emoji:'🚂❄️🎁',     answer:'the polar express', hint:'Christmas train journey' },
];

const active = new Map();

export default {
  command: ['emojitest', 'emojiquiz', 'guessmovie'],
  desc: 'Guess the movie from emojis — .emojitest',
  category: 'fun',
  run: async ({ jid, text, reply }) => {
    const existing = active.get(jid);
    if (existing) {
      const guess = text?.toLowerCase().trim();
      if (guess && guess === existing.answer) {
        active.delete(jid);
        return reply(`🎉 *Correct!* It was *${existing.answer.toUpperCase()}*!\n\nType .emojitest for a new round!`);
      } else if (guess) {
        return reply(`❌ Wrong! Try again or type *.hint* for a clue.`);
      }
    }
    const r = ROUNDS[Math.floor(Math.random() * ROUNDS.length)];
    active.set(jid, r);
    await reply(`🎬 *Emoji Movie Quiz!*\n\n${r.emoji}\n\nWhat movie/show is this?\n_Type your answer to guess!_`);
  },
};

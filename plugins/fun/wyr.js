// plugins/fun/wyr.js
const QUESTIONS = [
  ['Be able to fly', 'Be invisible'],
  ['Have unlimited money', 'Have unlimited time'],
  ['Live in the city', 'Live in the countryside'],
  ['Be always cold', 'Be always hot'],
  ['Only eat pizza forever', 'Only eat burgers forever'],
  ['Have super strength', 'Have super speed'],
  ['Speak every language', 'Play every instrument'],
  ['Live in the past', 'Live in the future'],
  ['Never use social media again', 'Never watch movies again'],
  ['Have 10 close friends', 'Have 1000 acquaintances'],
  ['Be famous', 'Be rich but unknown'],
  ['Be able to read minds', 'Be able to see the future'],
  ['Lose all your memories', 'Never make new memories'],
  ['Always be 10 minutes late', 'Always be 20 minutes early'],
  ['Have unlimited battery on your phone', 'Have free WiFi everywhere'],
];
export default {
  command: ['wyr', 'wouldyourather'],
  desc: 'Would You Rather — .wyr',
  category: 'fun',
  run: async ({ reply }) => {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    await reply(`🤔 *Would You Rather?*\n\n🅰️ ${q[0]}\n\n─ OR ─\n\n🅱️ ${q[1]}\n\n_Reply A or B!_`);
  },
};

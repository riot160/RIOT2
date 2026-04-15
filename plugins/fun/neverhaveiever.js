// plugins/fun/neverhaveiever.js
const STATEMENTS = [
  'Never have I ever stayed up all night watching a series',
  'Never have I ever eaten food off the floor',
  'Never have I ever lied to get out of trouble',
  'Never have I ever broken a bone',
  'Never have I ever cried at a movie',
  'Never have I ever cheated on a game',
  'Never have I ever sent a message to the wrong person',
  'Never have I ever forgotten someone\'s birthday',
  'Never have I ever talked to myself out loud',
  'Never have I ever fallen asleep in class or a meeting',
  'Never have I ever pretended to laugh when I didn\'t understand a joke',
  'Never have I ever googled myself',
  'Never have I ever screamed at a video game',
  'Never have I ever deleted a text and rewritten it 5+ times',
  'Never have I ever laughed so hard I cried',
];
export default {
  command: ['neverhaveiever', 'nhie'],
  desc: 'Never Have I Ever game — .nhie',
  category: 'fun',
  run: async ({ reply }) => {
    const s = STATEMENTS[Math.floor(Math.random() * STATEMENTS.length)];
    await reply(`🙈 *Never Have I Ever*\n\n${s}\n\n_👆 React with 👍 if you HAVE, 👎 if you haven\'t!_`);
  },
};

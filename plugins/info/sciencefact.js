// plugins/info/sciencefact.js
const FACTS = [
  'A teaspoon of neutron star material would weigh about 10 million tons.',
  'Humans share 60% of DNA with bananas.',
  'Light takes about 8 minutes 20 seconds to travel from the Sun to Earth.',
  'There are more atoms in a grain of sand than stars in the observable universe.',
  'The human brain generates about 20 watts of electrical power.',
  'Sound travels about 4 times faster in water than in air.',
  'Hot water freezes faster than cold water — this is called the Mpemba Effect.',
  'A bolt of lightning is 5 times hotter than the surface of the Sun.',
  'Octopuses have three hearts and blue blood.',
  'Sharks are older than trees — they\'ve existed for over 400 million years.',
  'Venus rotates so slowly that a day on Venus is longer than its year.',
  'There are more trees on Earth than stars in the Milky Way galaxy.',
  'Honey never expires — edible honey has been found in 3000-year-old Egyptian tombs.',
  'The human eye can detect a single photon of light in complete darkness.',
  'Water can boil and freeze at the same time — it\'s called the triple point.',
];
export default {
  command: ['sciencefact', 'science', 'scientificfact'],
  desc: 'Get a mind-blowing science fact — .sciencefact',
  category: 'info',
  run: async ({ reply }) => {
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
    await reply(`🔬 *Science Fact*\n\n${fact}\n\n_Powered by RIOT MD ⚡_`);
  },
};

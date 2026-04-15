// plugins/fun/dogfact.js
import fetch from 'node-fetch';
const FACTS = [
  'Dogs have a sense of smell 40 times stronger than humans.',
  'A dog\'s nose print is unique, like a human\'s fingerprint.',
  'Dogs can hear sounds 4 times farther than humans.',
  'Greyhounds can run up to 45 mph, making them the fastest dog breed.',
  'Dogs dream just like humans — you can see them twitch in their sleep.',
  'The average dog is as intelligent as a 2-year-old child.',
  'Dogs can detect certain diseases in humans through smell.',
  'A dog\'s whiskers help it navigate in the dark.',
];
export default {
  command: ['dogfact', 'dogfacts', 'wooffact'],
  desc: 'Get a random interesting dog fact — .dogfact',
  category: 'fun',
  run: async ({ reply }) => {
    try {
      const res = await fetch('https://dog-api.kinduff.com/api/facts');
      const d   = await res.json();
      await reply(`🐕 *Dog Fact*\n\n${d.facts?.[0] || FACTS[Math.floor(Math.random() * FACTS.length)]}`);
    } catch {
      await reply(`🐕 *Dog Fact*\n\n${FACTS[Math.floor(Math.random() * FACTS.length)]}`);
    }
  },
};

// plugins/fun/truth.js
const TRUTHS = [
  "What is your biggest fear?",
  "Have you ever lied to a best friend?",
  "What is your most embarrassing moment?",
  "Have you ever cheated on a test?",
  "What's the most childish thing you still do?",
  "Have you ever stolen anything?",
  "What's your biggest secret?",
  "Who is your secret crush?",
  "Have you ever blamed someone else for your mistake?",
  "What's your worst habit?",
];

export default {
  command: 'truth',
  desc: 'Get a truth question for truth-or-dare',
  category: 'fun',
  run: async ({ reply }) => {
    const t = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
    await reply(`🙈 *TRUTH*\n\n${t}`);
  },
};

// plugins/fun/typetest.js
const SENTENCES = [
  'The quick brown fox jumps over the lazy dog',
  'She sells seashells by the seashore on sunny days',
  'How much wood would a woodchuck chuck if a woodchuck could chuck wood',
  'To be or not to be that is the question',
  'All that glitters is not gold but it sure looks nice',
];
const pending = new Map();

export default {
  command: ['typetest', 'typingtest', 'wpm'],
  desc: 'Test your typing speed — .typetest to start',
  category: 'fun',
  run: async ({ jid, text, reply }) => {
    const game = pending.get(jid);
    if (game) {
      const secs    = (Date.now() - game.start) / 1000;
      const typed   = text?.trim();
      const correct = typed === game.sentence;
      const words   = game.sentence.split(' ').length;
      const wpm     = Math.round((words / secs) * 60);
      pending.delete(jid);
      return reply(
        correct
          ? `✅ *Test Complete!*\n\n⏱️ Time : ${secs.toFixed(1)}s\n⚡ WPM  : *${wpm}*\n${wpm > 60 ? '🏆 Excellent!' : wpm > 40 ? '👍 Good!' : '💪 Keep practising!'}`
          : `❌ *Wrong!* Test cancelled.\n\nThe correct sentence was:\n_"${game.sentence}"_\n\nType .typetest to try again.`
      );
    }
    const sentence = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    pending.set(jid, { sentence, start: Date.now() });
    await reply(`⌨️ *Typing Speed Test*\n\nType this sentence *exactly*:\n\n"${sentence}"\n\n_Timer starts NOW! Go!_ ⏱️`);
  },
};

// plugins/fun/quiz.js
import fetch from 'node-fetch';
function decodeHTML(s) {
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'");
}
const pending = new Map();
export default {
  command: ['quiz', 'genknowledge'],
  desc: 'General knowledge quiz — .quiz',
  category: 'fun',
  run: async ({ jid, text, reply }) => {
    const existing = pending.get(jid);
    if (existing) {
      const guess = text?.trim().toUpperCase();
      if (['A','B','C','D'].includes(guess)) {
        const isCorrect = guess === existing.correctLetter;
        pending.delete(jid);
        return reply(isCorrect
          ? `✅ *Correct!* 🎉\nAnswer: *${existing.correctLetter}. ${existing.correct}*`
          : `❌ *Wrong!*\nCorrect answer: *${existing.correctLetter}. ${existing.correct}*`
        );
      }
    }
    try {
      const res  = await fetch('https://opentdb.com/api.php?amount=1&type=multiple&difficulty=medium');
      const data = await res.json();
      const q    = data.results?.[0];
      if (!q) throw new Error('No question');
      const correct = decodeHTML(q.correct_answer);
      const wrong   = q.incorrect_answers.map(decodeHTML);
      const all     = [...wrong, correct].sort(() => Math.random() - 0.5);
      const letters = ['A','B','C','D'];
      const letter  = letters[all.indexOf(correct)];
      const opts    = all.map((o, i) => `${letters[i]}. ${o}`).join('\n');
      pending.set(jid, { correct, correctLetter: letter });
      setTimeout(() => { if (pending.get(jid)?.correct === correct) pending.delete(jid); }, 30000);
      await reply(
        `🧠 *General Knowledge Quiz*\n\n` +
        `❓ *${decodeHTML(q.question)}*\n\n` +
        `${opts}\n\n` +
        `_Reply A, B, C or D — 30 seconds!_`
      );
    } catch { await reply('❌ Could not load quiz. Try again!'); }
  },
};

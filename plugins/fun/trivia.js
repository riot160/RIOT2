// plugins/fun/trivia.js
import fetch from 'node-fetch';

const active = new Map(); // jid → { answer, timeout }

function decodeHTML(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

export default {
  command: ['trivia', 'quiz'],
  desc: 'Start a trivia quiz — answer within 30s — .trivia',
  category: 'fun',
  run: async ({ sock, jid, reply }) => {
    if (active.has(jid))
      return reply('⏳ A trivia question is already active! Answer it first.');

    try {
      const res  = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      const data = await res.json();
      const q    = data.results?.[0];
      if (!q) throw new Error('No question');

      const question   = decodeHTML(q.question);
      const correct    = decodeHTML(q.correct_answer);
      const wrong      = q.incorrect_answers.map(decodeHTML);
      const all        = [...wrong, correct].sort(() => Math.random() - 0.5);
      const letters    = ['A','B','C','D'];
      const answerIdx  = all.indexOf(correct);
      const answerLetter = letters[answerIdx];

      const optStr = all.map((o, i) => `${letters[i]}. ${o}`).join('\n');
      await reply(
        `🧠 *TRIVIA TIME!*\n\n` +
        `📚 Category: ${decodeHTML(q.category)}\n` +
        `⭐ Difficulty: ${q.difficulty}\n\n` +
        `❓ *${question}*\n\n` +
        `${optStr}\n\n` +
        `_Reply with A, B, C or D within 30 seconds!_`
      );

      // Set correct answer in active map
      const timeout = setTimeout(async () => {
        active.delete(jid);
        await sock.sendMessage(jid, {
          text: `⏰ *Time's up!*\n\nThe correct answer was:\n*${answerLetter}. ${correct}*`,
        });
      }, 30000);

      active.set(jid, { answer: answerLetter.toLowerCase(), correct, timeout });

    } catch {
      await reply('❌ Could not fetch trivia question. Try again.');
    }
  },
};

// Export the active map so the answer-checker can use it
export { active as triviaActive };

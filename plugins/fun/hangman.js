// plugins/fun/hangman.js
const WORDS = ['javascript','python','keyboard','elephant','mountain','rainbow',
  'hurricane','telescope','adventure','chocolate','democracy','butterfly','algorithm'];
const STAGES = ['😀','😊','😐','😟','😨','😰','💀'];

const games = new Map(); // jid → { word, guessed, wrong }

export default {
  command: ['hangman', 'wordguess'],
  desc: 'Play Hangman — .hangman to start, then send a letter',
  category: 'fun',
  run: async ({ jid, text, reply }) => {
    // Start / guess
    const input = text?.trim().toLowerCase();
    const existing = games.get(jid);

    if (!existing || input === 'start' || input === 'new') {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      const game = { word, guessed: new Set(), wrong: [] };
      games.set(jid, game);
      const display = word.split('').map(() => '_').join(' ');
      return reply(`🎮 *Hangman Started!*\n\nWord: \`${display}\`\n(${word.length} letters)\n\n_Type a letter to guess!_`);
    }

    if (!input || input.length !== 1 || !/[a-z]/.test(input))
      return reply('Send a *single letter* to guess!\nExample: just type *a*\nType *new* to start a new game.');

    const { word, guessed, wrong } = existing;
    if (guessed.has(input) || wrong.includes(input))
      return reply(`⚠️ You already guessed *${input}*! Try a different letter.`);

    if (word.includes(input)) {
      guessed.add(input);
    } else {
      wrong.push(input);
    }

    const display = word.split('').map(l => guessed.has(l) ? l : '_').join(' ');
    const won = word.split('').every(l => guessed.has(l));
    const lost = wrong.length >= 6;
    const stage = STAGES[Math.min(wrong.length, 6)];

    if (won) {
      games.delete(jid);
      return reply(`🎉 *You won!* The word was *${word.toUpperCase()}*!\n\nType .hangman to play again!`);
    }
    if (lost) {
      games.delete(jid);
      return reply(`${STAGES[6]} *Game Over!*\nThe word was *${word.toUpperCase()}*\n\nType .hangman to play again!`);
    }

    await reply(
      `${stage} *Hangman*\n\n` +
      `Word  : \`${display}\`\n` +
      `Wrong : ${wrong.length ? wrong.join(' ') : '—'} (${6 - wrong.length} left)\n` +
      `Used  : ${[...guessed].join(' ')}`
    );
  },
};

// plugins/fun/numberguess.js
const games = new Map(); // jid → { number, attempts, max }

export default {
  command: ['numguess', 'guessnumber'],
  desc: 'Guess the number game — .numguess to start',
  category: 'fun',
  run: async ({ jid, text, reply }) => {
    const input    = text?.trim();
    const existing = games.get(jid);

    if (!existing || input === 'start' || input === 'new') {
      const max    = 100;
      const number = Math.floor(Math.random() * max) + 1;
      games.set(jid, { number, attempts: 0, max });
      return reply(`🔢 *Number Guessing Game!*\n\nI'm thinking of a number between *1 and ${max}*\n\nType a number to guess! You have unlimited tries.\nType *stop* to give up.`);
    }

    if (input?.toLowerCase() === 'stop') {
      const g = existing;
      games.delete(jid);
      return reply(`❌ Game stopped! The number was *${g.number}*`);
    }

    const guess = parseInt(input);
    if (isNaN(guess)) return reply('Type a *number* to guess!\nExample: *42*\nType *stop* to give up.');

    existing.attempts++;
    const { number, attempts } = existing;

    if (guess === number) {
      games.delete(jid);
      const rating = attempts <= 5 ? '🏆 Amazing!' : attempts <= 10 ? '⭐ Great!' : '👍 Good job!';
      return reply(`🎉 *Correct!* The number was *${number}*!\n${rating} You got it in *${attempts}* guess${attempts > 1 ? 'es' : ''}!`);
    }

    const diff = Math.abs(guess - number);
    const hint = diff <= 5 ? '🔥 Very hot!' : diff <= 15 ? '🌡️ Warm' : diff <= 30 ? '❄️ Cold' : '🧊 Very cold!';
    const dir  = guess < number ? '⬆️ Go higher' : '⬇️ Go lower';

    await reply(`${guess < number ? '📈' : '📉'} *${dir}*\n${hint}\n\n_Attempt #${attempts}_`);
  },
};

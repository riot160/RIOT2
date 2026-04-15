// plugins/info/newword.js
import fetch from 'node-fetch';
export default {
  command: ['newword', 'vocabulary', 'vocab'],
  desc: 'Learn a new interesting English word — .newword',
  category: 'info',
  run: async ({ reply }) => {
    try {
      // Get a random uncommon but interesting word
      const res  = await fetch('https://api.datamuse.com/words?ml=interesting&max=100');
      const list = await res.json();
      const word = list[Math.floor(Math.random() * list.length)]?.word;
      if (!word) throw new Error();
      // Get its definition
      const defRes  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const defData = await defRes.json();
      if (!Array.isArray(defData)) throw new Error();
      const entry   = defData[0];
      const meaning = entry.meanings[0];
      const def     = meaning.definitions[0];
      await reply(
        `📚 *New Word of the Moment*\n\n` +
        `✏️  Word    : *${entry.word}*\n` +
        `🏷️  Type    : ${meaning.partOfSpeech}\n` +
        `📖 Meaning : ${def.definition}\n` +
        `${def.example ? `💬 Example : _"${def.example}"_\n` : ''}` +
        `${meaning.synonyms?.length ? `🔗 Synonyms: ${meaning.synonyms.slice(0,4).join(', ')}` : ''}`
      );
    } catch { await reply('❌ Could not fetch a new word. Try again!'); }
  },
};

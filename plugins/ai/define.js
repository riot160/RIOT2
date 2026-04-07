// plugins/ai/define.js
import fetch from 'node-fetch';

export default {
  command: ['define', 'dict', 'meaning'],
  desc: 'Look up a word definition — .define <word>',
  category: 'ai',
  run: async ({ args, reply }) => {
    const word = args[0];
    if (!word) return reply('Usage: .define <word>');
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const d   = await res.json();
      if (!Array.isArray(d)) return reply(`❌ No definition found for *${word}*`);
      const entry   = d[0];
      const meaning = entry.meanings[0];
      const def     = meaning.definitions[0];
      const syns    = meaning.synonyms?.slice(0, 4).join(', ');
      await reply(
`📖 *${entry.word}*  _(${meaning.partOfSpeech})_

📝 ${def.definition}
${def.example ? `\n💬 _"${def.example}"_` : ''}
${syns ? `\n🔗 Synonyms: ${syns}` : ''}`
      );
    } catch (e) {
      await reply('❌ Dictionary error: ' + e.message);
    }
  },
};

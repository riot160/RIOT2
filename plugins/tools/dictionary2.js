// plugins/tools/dictionary2.js
import fetch from 'node-fetch';
export default {
  command: ['dictionary2', 'dict2', 'fulldefine'],
  desc: 'Full dictionary lookup with all meanings — .dictionary2 run',
  category: 'tools',
  run: async ({ args, reply }) => {
    const word = args[0];
    if (!word) return reply('Usage: .dictionary2 <word>\nExample: .dictionary2 run');
    try {
      const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();
      if (!Array.isArray(data)) return reply(`❌ No definition found for *${word}*`);
      const entry = data[0];
      let text = `📚 *${entry.word}*`;
      if (entry.phonetic) text += `  /${entry.phonetic}/`;
      text += '\n' + '─'.repeat(28) + '\n';
      entry.meanings.slice(0, 3).forEach(m => {
        text += `\n*${m.partOfSpeech}*\n`;
        m.definitions.slice(0, 2).forEach((d, i) => {
          text += `${i + 1}. ${d.definition}\n`;
          if (d.example) text += `   _"${d.example}"_\n`;
        });
        if (m.synonyms?.length) text += `💡 Synonyms: ${m.synonyms.slice(0,5).join(', ')}\n`;
      });
      await reply(text.trim());
    } catch (e) { await reply('❌ Dictionary lookup failed: ' + e.message); }
  },
};

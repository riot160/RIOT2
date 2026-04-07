// plugins/ai/translate.js
import fetch from 'node-fetch';

export default {
  command: ['translate', 'tr'],
  desc: 'Translate text — .tr <lang> <text>  e.g. .tr sw Hello',
  category: 'ai',
  run: async ({ args, reply }) => {
    const lang   = args[0];
    const phrase = args.slice(1).join(' ');
    if (!lang || !phrase)
      return reply('Usage: .tr <language_code> <text>\nExample: .tr sw Hello World\nCodes: sw=Swahili, fr=French, es=Spanish, ar=Arabic');
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(phrase)}&langpair=auto|${lang}`
      );
      const d = await res.json();
      const result = d.responseData?.translatedText;
      if (!result || result === phrase) throw new Error('Translation returned no result');
      await reply(`🌐 *Translation → ${lang.toUpperCase()}*\n\n*Original:* ${phrase}\n*Translated:* ${result}`);
    } catch (e) {
      await reply('❌ Translation failed: ' + e.message);
    }
  },
};

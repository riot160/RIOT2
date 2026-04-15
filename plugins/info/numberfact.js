// plugins/info/numberfact.js
import fetch from 'node-fetch';
export default {
  command: ['numberfact', 'numfact', 'mathfact'],
  desc: 'Get an interesting fact about any number — .numberfact 42',
  category: 'info',
  run: async ({ args, reply }) => {
    const n = args[0] || Math.floor(Math.random() * 1000);
    try {
      const res  = await fetch(`http://numbersapi.com/${n}/math`);
      const fact = await res.text();
      await reply(`🔢 *Number Fact: ${n}*\n\n${fact}`);
    } catch { await reply(`🔢 *Number: ${n}*\n\n_${n} is a fascinating number!_`); }
  },
};

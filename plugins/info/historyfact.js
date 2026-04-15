// plugins/info/historyfact.js
import fetch from 'node-fetch';
export default {
  command: ['historyfact', 'onthisday', 'history'],
  desc: 'What happened today in history — .historyfact',
  category: 'info',
  run: async ({ reply }) => {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const day   = now.getDate();
    try {
      const res   = await fetch(`https://history.muffinlabs.com/date/${month}/${day}`);
      const d     = await res.json();
      const events = d.data?.Events;
      if (!events?.length) throw new Error();
      const picks = [0, Math.floor(events.length / 2), events.length - 1].map(i => events[i]);
      let text = `📅 *On This Day — ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}*\n${'─'.repeat(28)}\n\n`;
      picks.forEach(e => { text += `📌 *${e.year}* — ${e.text}\n\n`; });
      await reply(text.trim());
    } catch { await reply(`📅 *On This Day*\n\nHistory is happening right now — you\'re part of it! 🌍`); }
  },
};

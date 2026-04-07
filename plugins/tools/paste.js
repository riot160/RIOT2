// plugins/tools/paste.js
import fetch from 'node-fetch';

export default {
  command: ['paste', 'pastebin'],
  desc: 'Upload text and get a shareable link — .paste <text>',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .paste <text>\nExample: .paste Hello world this is my note');
    try {
      const res = await fetch('https://api.rentry.co/api/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://rentry.co',
        },
        body: new URLSearchParams({ text }),
      });
      const d = await res.json();
      if (!d.url) throw new Error('No URL returned');
      await reply(`📋 *Paste Created!*\n\n🔗 ${d.url}\n\n_Your text is now accessible at this link._`);
    } catch {
      await reply('❌ Paste service unavailable. Try again.');
    }
  },
};

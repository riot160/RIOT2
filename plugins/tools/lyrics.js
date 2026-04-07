// plugins/tools/lyrics.js
import fetch from 'node-fetch';

export default {
  command: ['lyrics', 'lyric'],
  desc: 'Search song lyrics — .lyrics <song name>',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .lyrics <song name>\nExample: .lyrics Bohemian Rhapsody');
    await reply(`🎵 Searching lyrics for: *${text}*…`);
    try {
      const res = await fetch(
        `https://lyrist.vercel.app/api/${encodeURIComponent(text)}`
      );
      const d = await res.json();
      if (!d?.lyrics) return reply(`❌ No lyrics found for: *${text}*`);
      const preview = d.lyrics.slice(0, 900);
      const trimmed = d.lyrics.length > 900;
      await reply(
`🎵 *${d.title}*
👤 ${d.artist}
${'─'.repeat(25)}

${preview}${trimmed ? '\n\n_(lyrics trimmed — too long to display fully)_' : ''}`
      );
    } catch {
      await reply('❌ Lyrics service unavailable. Try again later.');
    }
  },
};

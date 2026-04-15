// plugins/tools/urlencode.js
export default {
  command: ['urlencode', 'urldecode', 'url'],
  desc: 'URL encode or decode text — .urlencode hello world',
  category: 'tools',
  run: async ({ command, text, reply }) => {
    if (!text) return reply('Usage:\n.urlencode <text>\n.urldecode <encoded text>');
    try {
      if (command === 'urldecode') {
        await reply(`🔓 *URL Decoded*\n\n${decodeURIComponent(text)}`);
      } else {
        await reply(`🔒 *URL Encoded*\n\n${encodeURIComponent(text)}`);
      }
    } catch { await reply('❌ Invalid input.'); }
  },
};

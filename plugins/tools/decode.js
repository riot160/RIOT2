// plugins/tools/decode.js
export default {
  command: ['decode', 'b64decode'],
  desc: 'Base64 decode text — .decode <base64>',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .decode <base64 string>');
    try {
      const decoded = Buffer.from(text, 'base64').toString('utf-8');
      await reply(`🔓 *Base64 Decoded*\n\n${decoded}`);
    } catch {
      await reply('❌ Invalid base64 string.');
    }
  },
};

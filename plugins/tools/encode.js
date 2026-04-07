// plugins/tools/encode.js
export default {
  command: ['encode', 'b64encode'],
  desc: 'Base64 encode text — .encode <text>',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .encode <text>');
    const encoded = Buffer.from(text).toString('base64');
    await reply(`🔐 *Base64 Encoded*\n\n${encoded}`);
  },
};

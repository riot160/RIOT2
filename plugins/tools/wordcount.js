// plugins/tools/wordcount.js
export default {
  command: ['wordcount', 'wc', 'countwords'],
  desc: 'Count words, characters, lines — .wordcount <text>',
  category: 'tools',
  run: async ({ text, msg, reply }) => {
    const q       = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const content = text || q?.conversation || q?.extendedTextMessage?.text || '';
    if (!content) return reply('Usage: .wordcount <text>  or reply to any message');
    const words   = content.trim().split(/\s+/).filter(Boolean).length;
    const chars   = content.length;
    const noSpace = content.replace(/\s/g, '').length;
    const lines   = content.split('\n').length;
    const paras   = content.split(/\n\s*\n/).filter(Boolean).length;
    await reply(
      `📊 *Word Count Analysis*\n\n` +
      `📝 Words      : ${words}\n` +
      `🔤 Characters : ${chars}\n` +
      `🔡 No spaces  : ${noSpace}\n` +
      `📄 Lines      : ${lines}\n` +
      `📑 Paragraphs : ${paras}`
    );
  },
};

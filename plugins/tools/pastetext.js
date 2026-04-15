// plugins/tools/pastetext.js
export default {
  command: ['pastetext', 'textfile', 'sendtxt'],
  desc: 'Send text as a downloadable .txt file — .pastetext <text>',
  category: 'tools',
  run: async ({ text, sock, jid, msg, reply }) => {
    const q = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const content = text || q?.conversation || q?.extendedTextMessage?.text || '';
    if (!content) return reply('Usage: .pastetext <text>  or reply to any message');
    const buf = Buffer.from(content, 'utf8');
    await sock.sendMessage(jid, {
      document: buf,
      mimetype: 'text/plain',
      fileName: `RIOT_MD_${Date.now()}.txt`,
      caption: `📄 Text file (${content.length} characters)`,
    }, { quoted: msg });
  },
};

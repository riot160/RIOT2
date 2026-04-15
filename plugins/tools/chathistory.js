// plugins/tools/chathistory.js
import { msgCache } from '../../lib/handler.js';
export default {
  command: ['chathistory', 'history', 'exportchat'],
  desc: 'Export recent cached chat messages as a text file — .chathistory',
  category: 'tools',
  owner: true,
  run: async ({ jid, sock, msg, reply }) => {
    const msgs = [...msgCache.values()]
      .filter(m => m.jid === jid && m.text)
      .sort((a, b) => a.time - b.time)
      .slice(-50);
    if (!msgs.length) return reply('❌ No cached messages for this chat yet.');
    const lines = msgs.map(m => {
      const time = new Date(m.time).toLocaleTimeString();
      return `[${time}] ${m.name}: ${m.text}`;
    }).join('\n');
    const content = `Chat History Export\nChat: ${jid}\nExported: ${new Date().toLocaleString()}\n${'='.repeat(40)}\n\n${lines}`;
    const buf = Buffer.from(content, 'utf8');
    await sock.sendMessage(jid, {
      document: buf,
      mimetype: 'text/plain',
      fileName: `chat_${Date.now()}.txt`,
      caption: `📋 ${msgs.length} recent messages exported`,
    }, { quoted: msg });
  },
};

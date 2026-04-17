// plugins/tools/chathistory.js
// Fixed: removed circular import from lib/handler.js
// Now uses a local in-memory store instead

// Simple per-chat message log (filled by handler via the normal message flow)
export const chatLog = new Map(); // jid → [{ name, text, time }]

export function logMessage(jid, name, text) {
  if (!chatLog.has(jid)) chatLog.set(jid, []);
  const log = chatLog.get(jid);
  log.push({ name, text, time: Date.now() });
  if (log.length > 100) log.shift(); // keep last 100
}

export default {
  command: ['chathistory', 'history', 'exportchat'],
  desc: 'Export recent chat messages as a text file — .chathistory',
  category: 'tools',
  owner: true,
  run: async ({ jid, sock, msg, reply }) => {
    const log = chatLog.get(jid) || [];
    if (!log.length)
      return reply(
        '❌ No chat history recorded yet.\n\n' +
        '_Chat history is collected while the bot is running._'
      );
    const lines = log.map(m => {
      const time = new Date(m.time).toLocaleTimeString();
      return `[${time}] ${m.name}: ${m.text}`;
    }).join('\n');
    const content =
      `Chat History Export\n` +
      `Chat: ${jid}\n` +
      `Exported: ${new Date().toLocaleString()}\n` +
      `${'='.repeat(40)}\n\n${lines}`;
    await sock.sendMessage(jid, {
      document: Buffer.from(content, 'utf8'),
      mimetype: 'text/plain',
      fileName: `chat_${Date.now()}.txt`,
      caption: `📋 ${log.length} messages exported`,
    }, { quoted: msg });
  },
};

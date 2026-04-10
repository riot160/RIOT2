// plugins/owner/react.js
export default {
  command: 'react',
  desc: 'React to a quoted message with any emoji — .react 🔥',
  category: 'owner',
  owner: true,
  run: async ({ sock, msg, args, jid, reply }) => {
    const emoji  = args[0];
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const qKey   = ctx?.stanzaId;
    const qPart  = ctx?.participant;

    if (!emoji)  return reply('Usage: .react <emoji>\nExample: .react 🔥\nReply to a message with this command.');
    if (!qKey)   return reply('Reply to a message with .react <emoji>');

    try {
      await sock.sendMessage(jid, {
        react: {
          text: emoji,
          key: {
            remoteJid:   jid,
            id:          qKey,
            participant: qPart,
            fromMe:      false,
          },
        },
      });
    } catch (e) {
      await reply('❌ Could not react: ' + e.message);
    }
  },
};

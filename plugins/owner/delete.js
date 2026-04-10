// plugins/owner/delete.js
export default {
  command: ['delete', 'del', 'unsend'],
  desc: 'Delete a bot message — reply to it with .delete',
  category: 'owner',
  owner: true,
  run: async ({ sock, msg, jid, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const qKey   = ctx?.stanzaId;
    const qPart  = ctx?.participant;

    if (!quoted || !qKey)
      return reply('Reply to a bot message with .delete to remove it.');

    try {
      await sock.sendMessage(jid, {
        delete: {
          remoteJid:   jid,
          fromMe:      true,
          id:          qKey,
          participant: qPart,
        },
      });
    } catch (e) {
      await reply('❌ Could not delete message: ' + e.message);
    }
  },
};

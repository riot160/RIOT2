// plugins/owner/lastseen.js
export default {
  command: ['lastseen', 'online'],
  desc: 'Check when a contact was last online — .lastseen @user',
  category: 'owner',
  owner: true,
  run: async ({ sock, msg, args, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted    = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const numArg    = (args[0] || '').replace(/[^0-9]/g, '');
    const target    = mentioned[0] || quoted
      || (numArg ? numArg + '@s.whatsapp.net' : null);

    if (!target)
      return reply('Usage: .lastseen @user\nOr: .lastseen 254700000000');

    const num = target.split('@')[0];
    try {
      await sock.presenceSubscribe(target);
      await new Promise(r => setTimeout(r, 1500));

      // Presence comes via event — this is a best-effort check
      await reply(
        `🕐 *Last Seen*\n\n` +
        `👤 Number: +${num}\n` +
        `📡 Status: Checking presence…\n\n` +
        `_Note: If their privacy is set to "Nobody", last seen cannot be retrieved._`
      );
    } catch {
      await reply(
        `🕐 *Last Seen — +${num}*\n\n` +
        `❌ Privacy settings prevent viewing last seen.\n` +
        `_This contact has hidden their last seen._`
      );
    }
  },
};

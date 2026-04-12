// plugins/group/tag.js
export default {
  command: ['tag', 'tagmembers'],
  desc: 'Tag specific mentioned members — .tag @user1 @user2 message',
  category: 'group',
  group: true,
  run: async ({ sock, jid, msg, args, text }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned.length) {
      await sock.sendMessage(jid, {
        text: 'Usage: .tag @user1 @user2 <message>\nMention people you want to tag.',
      });
      return;
    }
    const msgText  = args.filter(a => !a.startsWith('@')).join(' ') || '👆';
    const tagLine  = mentioned.map(j => `@${j.split('@')[0]}`).join(' ');
    await sock.sendMessage(jid, {
      text:     `${msgText}\n\n${tagLine}`,
      mentions: mentioned,
    });
  },
};

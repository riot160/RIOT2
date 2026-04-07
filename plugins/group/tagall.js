// plugins/group/tagall.js
export default {
  command: ['tagall', 'everyone', 'all'],
  desc: 'Mention all group members — .tagall <optional message>',
  category: 'group',
  group: true,
  run: async ({ sock, jid, text, reply }) => {
    const meta     = await sock.groupMetadata(jid);
    const members  = meta.participants.map(p => p.id);
    const mentions = members;
    const tags     = members.map(m => `@${m.split('@')[0]}`).join(' ');
    const body     = text ? `📢 *${text}*\n\n${tags}` : `📢 ${tags}`;
    await sock.sendMessage(jid, { text: body, mentions });
  },
};

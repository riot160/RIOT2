// plugins/group/kickall.js
export default {
  command: 'kickall',
  desc: 'Kick all non-admin members from the group — .kickall',
  category: 'group',
  group: true,
  admin: true,
  owner: true,
  run: async ({ sock, jid, reply }) => {
    const meta    = await sock.groupMetadata(jid);
    const members = meta.participants.filter(p => !p.admin);
    if (!members.length) return reply('No regular members to kick.');
    await reply(`⚠️ Kicking *${members.length}* member(s)…`);
    let done = 0, failed = 0;
    for (const m of members) {
      try {
        await sock.groupParticipantsUpdate(jid, [m.id], 'remove');
        done++;
        await new Promise(r => setTimeout(r, 800)); // small delay to avoid ban
      } catch { failed++; }
    }
    await reply(`✅ Kicked *${done}* member(s)\n❌ Failed: ${failed}`);
  },
};

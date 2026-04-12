// plugins/group/vcf.js
export default {
  command: ['vcf', 'exportcontacts', 'contacts'],
  desc: 'Export all group members as a VCF contacts file',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, msg, reply }) => {
    await reply('📇 Generating contacts file…');
    try {
      const meta = await sock.groupMetadata(jid);
      let vcf    = '';
      for (const p of meta.participants) {
        const num  = p.id.split('@')[0].split(':')[0];
        const name = `${meta.subject} Member`;
        vcf +=
          `BEGIN:VCARD\nVERSION:3.0\n` +
          `FN:+${num}\n` +
          `TEL;TYPE=CELL:+${num}\n` +
          `END:VCARD\n`;
      }
      const buf = Buffer.from(vcf, 'utf-8');
      await sock.sendMessage(jid, {
        document:  buf,
        mimetype:  'text/vcard',
        fileName:  `${meta.subject.replace(/\s+/g, '_')}_members.vcf`,
        caption:   `📇 *${meta.subject}*\n👥 ${meta.participants.length} contacts exported`,
      }, { quoted: msg });
    } catch (e) {
      await reply('❌ VCF export failed: ' + e.message);
    }
  },
};

// plugins/info/npm.js
import fetch from 'node-fetch';
export default {
  command: ['npm', 'npminfo', 'package'],
  desc: 'Get NPM package info — .npm express',
  category: 'info',
  run: async ({ args, reply }) => {
    const pkg = args[0]?.toLowerCase();
    if (!pkg) return reply('Usage: .npm <package name>\nExample: .npm express\n.npm baileys\n.npm axios');
    try {
      const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
      if (!res.ok) return reply(`❌ Package *${pkg}* not found on NPM.`);
      const d       = await res.json();
      const latest  = d['dist-tags']?.latest;
      const ver     = d.versions?.[latest];
      const dl      = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg}`);
      const dlData  = await dl.json();
      await reply(
        `📦 *NPM: ${d.name}*\n` +
        `${'─'.repeat(28)}\n` +
        `📌 Version   : ${latest}\n` +
        `📝 Desc      : ${d.description || '—'}\n` +
        `👤 Author    : ${typeof d.author === 'object' ? d.author?.name : d.author || '—'}\n` +
        `📜 License   : ${ver?.license || '—'}\n` +
        `⬇️  Downloads  : ${dlData.downloads?.toLocaleString() || '—'}/week\n` +
        `📅 Updated   : ${d.time?.[latest]?.slice(0, 10) || '—'}\n` +
        `🔗 NPM       : https://npmjs.com/package/${pkg}`
      );
    } catch (e) { await reply('❌ NPM lookup failed: ' + e.message); }
  },
};

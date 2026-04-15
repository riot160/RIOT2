// plugins/tools/screenshot2.js
import fetch from 'node-fetch';
export default {
  command: ['screenshot2', 'fullss', 'pagess'],
  desc: 'Full-page screenshot of a website — .screenshot2 https://google.com',
  category: 'tools',
  run: async ({ args, sock, jid, msg, reply }) => {
    const url = args[0];
    if (!url || !url.startsWith('http'))
      return reply('Usage: .screenshot2 <url>\nExample: .screenshot2 https://google.com');
    await reply('📸 Taking full-page screenshot…');
    try {
      const ssUrl  = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1280`;
      const res    = await fetch(ssUrl, { signal: AbortSignal.timeout(15000) });
      const buf    = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(jid,
        { image: buf, caption: `📸 *Screenshot*\n🌐 ${url}` },
        { quoted: msg }
      );
    } catch (e) { await reply('❌ Screenshot failed: ' + e.message); }
  },
};

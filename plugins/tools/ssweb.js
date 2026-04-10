// plugins/tools/ssweb.js
import fetch from 'node-fetch';

export default {
  command: ['ssweb', 'screenshot', 'ss'],
  desc: 'Take a screenshot of any website — .ssweb https://google.com',
  category: 'tools',
  run: async ({ args, sock, jid, msg, reply }) => {
    const url = args[0];
    if (!url || !url.startsWith('http'))
      return reply('Usage: .ssweb <url>\nExample: .ssweb https://google.com');
    await reply('📸 Taking screenshot…');
    try {
      // Uses the free ScreenshotAPI / thum.io
      const ssUrl = `https://image.thum.io/get/width/1280/crop/800/${encodeURIComponent(url)}`;
      const res   = await fetch(ssUrl);
      if (!res.ok) throw new Error('Screenshot failed');
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(jid,
        { image: buf, caption: `📸 *Screenshot*\n🌐 ${url}` },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ Screenshot failed: ' + e.message);
    }
  },
};

// plugins/info/nasa.js
import fetch from 'node-fetch';
export default {
  command: ['nasa', 'apod', 'spacepic'],
  desc: 'Get NASA Astronomy Picture of the Day — .nasa',
  category: 'info',
  run: async ({ sock, jid, msg, reply }) => {
    await reply('🚀 Fetching NASA picture of the day…');
    try {
      // Free NASA APOD endpoint (demo key allows 30 req/hour)
      const res  = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
      const d    = await res.json();
      if (d.error) throw new Error(d.error.message);
      const caption =
        `🌌 *NASA: Astronomy Picture of the Day*\n` +
        `${'─'.repeat(30)}\n` +
        `📸 *${d.title}*\n` +
        `📅 Date  : ${d.date}\n` +
        `${'─'.repeat(30)}\n` +
        `📝 ${d.explanation?.slice(0, 300)}…`;
      if (d.url && d.media_type === 'image') {
        const imgRes = await fetch(d.url);
        const buf    = Buffer.from(await imgRes.arrayBuffer());
        await sock.sendMessage(jid, { image: buf, caption }, { quoted: msg });
      } else {
        await reply(caption + (d.url ? `\n\n🔗 ${d.url}` : ''));
      }
    } catch (e) { await reply('❌ NASA API failed: ' + e.message); }
  },
};

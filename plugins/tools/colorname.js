// plugins/tools/colorname.js
import fetch from 'node-fetch';
export default {
  command: ['colorname', 'colorinfo', 'hexcolor'],
  desc: 'Get full color info + preview from hex — .colorname ff5733',
  category: 'tools',
  run: async ({ args, sock, jid, msg, reply }) => {
    const hex  = (args[0] || '').replace('#', '').trim();
    if (!hex || !/^[0-9a-fA-F]{3,6}$/.test(hex))
      return reply('Usage: .colorname <hex>\nExample: .colorname ff5733\n.colorname #1DA1F2');
    try {
      const res  = await fetch(`https://www.thecolorapi.com/id?hex=${hex}`);
      const d    = await res.json();
      // Generate a solid color image via dummyimage.com
      const imgUrl = `https://dummyimage.com/300x200/${hex}/${hex}.png`;
      const caption =
        `🎨 *Color: ${d.name?.value || hex}*\n` +
        `${'─'.repeat(24)}\n` +
        `#️⃣  HEX  : #${hex.toUpperCase()}\n` +
        `🔴 RGB  : ${d.rgb?.value}\n` +
        `🌈 HSL  : ${d.hsl?.value}\n` +
        `🌊 HSV  : ${d.hsv?.value}\n` +
        `🖨️  CMYK : ${d.cmyk?.value}`;
      try {
        const imgRes = await fetch(imgUrl);
        const buf    = Buffer.from(await imgRes.arrayBuffer());
        await sock.sendMessage(jid, { image: buf, caption }, { quoted: msg });
      } catch { await reply(caption); }
    } catch (e) { await reply('❌ Color lookup failed: ' + e.message); }
  },
};

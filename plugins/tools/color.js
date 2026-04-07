// plugins/tools/color.js
import fetch from 'node-fetch';

export default {
  command: ['color', 'colour', 'hex'],
  desc: 'Get color info from a hex code — .color #ff5733',
  category: 'tools',
  run: async ({ args, reply }) => {
    const hex = (args[0] || '').replace('#', '').trim();
    if (!hex) return reply('Usage: .color <hex code>\nExample: .color #ff5733');
    if (!/^[0-9a-fA-F]{3,6}$/.test(hex))
      return reply('❌ Invalid hex color.\nExample: .color ff5733  or  .color #ff5733');
    try {
      const res = await fetch(`https://www.thecolorapi.com/id?hex=${hex}`);
      const d   = await res.json();
      await reply(
`🎨 *Color Info*

🏷️  Name : ${d.name?.value || 'Unknown'}
#️⃣  HEX  : #${hex.toUpperCase()}
🔴 RGB  : ${d.rgb?.value || '—'}
🌈 HSL  : ${d.hsl?.value || '—'}
🌊 HSV  : ${d.hsv?.value || '—'}
🖨️  CMYK : ${d.cmyk?.value || '—'}`
      );
    } catch {
      await reply('❌ Color lookup failed. Try again.');
    }
  },
};

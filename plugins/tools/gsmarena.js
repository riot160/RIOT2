// plugins/tools/gsmarena.js
import fetch from 'node-fetch';

export default {
  command: ['gsmarena', 'phonespec', 'specs'],
  desc: 'Look up phone specifications — .gsmarena Samsung Galaxy S24',
  category: 'tools',

  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text)
      return reply('Usage: .gsmarena <phone model>\nExamples:\n• .gsmarena iPhone 15\n• .gsmarena Samsung Galaxy S24\n• .gsmarena Tecno Camon 20');

    await reply(`📱 Searching specs: *${text}*…`);

    try {
      // Use the free phone specs API
      const res  = await fetch(
        `https://phone-specs-api.azurewebsites.net/search?query=${encodeURIComponent(text)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' } }
      );
      const data = await res.json();

      const phones = data?.data || data?.phones || [];
      if (!phones.length)
        return reply(`❌ No phone found for: *${text}*\n\nTry a more specific model name.`);

      const phone = phones[0];

      // Get detailed specs
      const slug    = phone.slug || phone.phone_name?.toLowerCase().replace(/\s+/g, '-');
      let   detail  = null;

      if (slug) {
        const res2  = await fetch(`https://phone-specs-api.azurewebsites.net/${slug}`).catch(() => null);
        if (res2?.ok) detail = await res2.json().catch(() => null);
      }

      const p = detail?.data || detail || phone;

      const caption =
        `📱 *${p.phone_name || text}*\n` +
        `${'─'.repeat(30)}\n` +
        `🏢 Brand      : ${p.brand || '—'}\n` +
        `📅 Released   : ${p.release_date || p.announced || '—'}\n` +
        `💵 Price      : ${p.price || p.cost || '—'}\n` +
        `${'─'.repeat(30)}\n` +
        `🖥️  Display    : ${p.display?.size || p.screen_size || '—'}\n` +
        `⚡ Chipset    : ${p.hardware?.cpu || p.chipset || '—'}\n` +
        `🧠 RAM        : ${p.hardware?.ram || p.ram || '—'}\n` +
        `💾 Storage    : ${p.hardware?.storage || p.storage || '—'}\n` +
        `📷 Camera     : ${p.main_camera?.megapixels || p.camera || '—'}\n` +
        `🔋 Battery    : ${p.battery?.capacity || p.battery || '—'}\n` +
        `📡 Network    : ${p.network?.technology || p.network || '—'}\n` +
        `🖥️  OS         : ${p.software?.os || p.os || '—'}\n` +
        `${'─'.repeat(30)}\n` +
        `_Specs from GSMArena_`;

      const imgUrl = p.thumbnail || p.image || p.phone_images?.[0];
      if (imgUrl) {
        try {
          const imgRes = await fetch(imgUrl);
          const imgBuf = Buffer.from(await imgRes.arrayBuffer());
          await sock.sendMessage(jid, { image: imgBuf, caption }, { quoted: msg });
          return;
        } catch {}
      }
      await reply(caption);
    } catch (e) {
      await reply('❌ Phone specs lookup failed: ' + e.message);
    }
  },
};

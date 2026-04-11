// plugins/download/igprofile.js
// Instagram Profile Lookup — .igprofile <username>
import fetch from 'node-fetch';

export default {
  command: ['igprofile', 'igp', 'instagramprofile'],
  desc: 'Get Instagram profile info — .igprofile <username>',
  category: 'download',

  run: async ({ args, sock, jid, msg, reply }) => {
    const username = (args[0] || '').replace('@', '').trim();
    if (!username)
      return reply('Usage: .igprofile <username>\nExample: .igprofile cristiano');

    await reply(`🔍 Looking up Instagram: *@${username}*…`);

    try {
      const res = await fetch(
        `https://www.instagram.com/${username}/?__a=1&__d=dis`,
        {
          headers: {
            'User-Agent': 'Instagram 76.0.0.15.395 Android',
            'Accept': 'application/json',
          },
        }
      );

      // Fallback: use public scraper
      const res2 = await fetch(
        `https://api.instagramapi.org/profile/${username}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const data = await res2.json();

      if (!data || data.error) throw new Error('Profile not found');

      const formatNum = (n) => {
        if (!n && n !== 0) return '—';
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
        return String(n);
      };

      const caption =
        `📸 *Instagram Profile*\n` +
        `${'─'.repeat(28)}\n` +
        `👤 Name      : ${data.full_name || '—'}\n` +
        `🔖 Username  : @${data.username || username}\n` +
        `📝 Bio       : ${data.biography || 'No bio'}\n` +
        `${'─'.repeat(28)}\n` +
        `👥 Followers : ${formatNum(data.follower_count)}\n` +
        `➡️  Following : ${formatNum(data.following_count)}\n` +
        `📷 Posts     : ${formatNum(data.media_count)}\n` +
        `${'─'.repeat(28)}\n` +
        `✅ Verified  : ${data.is_verified ? 'Yes ✓' : 'No'}\n` +
        `🔒 Private   : ${data.is_private ? 'Yes' : 'No'}\n` +
        `🔗 Profile   : https://instagram.com/${data.username || username}`;

      if (data.profile_pic_url) {
        try {
          const imgRes = await fetch(data.profile_pic_url);
          const imgBuf = Buffer.from(await imgRes.arrayBuffer());
          await sock.sendMessage(jid, { image: imgBuf, caption }, { quoted: msg });
        } catch {
          await reply(caption);
        }
      } else {
        await reply(caption);
      }
    } catch (e) {
      await reply(
        `❌ Could not find Instagram profile *@${username}*\n\n` +
        `Make sure the username is correct and the account is public.`
      );
    }
  },
};

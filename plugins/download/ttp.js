// plugins/download/ttp.js
// TikTok Profile Lookup — .ttp <username>
import fetch from 'node-fetch';

export default {
  command: ['ttp', 'tiktokprofile', 'ttprofile'],
  desc: 'Get TikTok profile info and picture — .ttp <username>',
  category: 'download',

  run: async ({ args, sock, jid, msg, reply }) => {
    const username = (args[0] || '').replace('@', '').trim();
    if (!username)
      return reply(
        '📱 Usage: .ttp <username>\n\nExamples:\n' +
        '• .ttp charlidamelio\n' +
        '• .ttp @khaby.lame'
      );

    await reply(`🔍 Looking up TikTok profile: *@${username}*…`);

    try {
      // TikTok profile via RapidAPI-compatible free endpoint
      const res = await fetch(
        `https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(username)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const data = await res.json();

      if (data?.code !== 0 || !data?.data?.user) {
        return reply(`❌ Could not find TikTok profile for *@${username}*\n\nMake sure the username is correct.`);
      }

      const u = data.data.user;
      const s = data.data.stats;

      const formatNum = (n) => {
        if (!n && n !== 0) return '—';
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
        return String(n);
      };

      const caption =
        `📱 *TikTok Profile*\n` +
        `${'─'.repeat(28)}\n` +
        `👤 Name       : ${u.nickname || '—'}\n` +
        `🔖 Username   : @${u.uniqueId || username}\n` +
        `📝 Bio        : ${u.signature || 'No bio'}\n` +
        `${'─'.repeat(28)}\n` +
        `❤️  Likes      : ${formatNum(s?.heartCount)}\n` +
        `👥 Followers  : ${formatNum(s?.followerCount)}\n` +
        `➡️  Following  : ${formatNum(s?.followingCount)}\n` +
        `🎬 Videos     : ${formatNum(s?.videoCount)}\n` +
        `${'─'.repeat(28)}\n` +
        `✅ Verified   : ${u.verified ? 'Yes ✓' : 'No'}\n` +
        `🔒 Private    : ${u.privateAccount ? 'Yes' : 'No'}\n` +
        `🌍 Region     : ${u.region || '—'}\n` +
        `🔗 Profile    : https://www.tiktok.com/@${u.uniqueId || username}`;

      // Send profile picture + info
      if (u.avatarLarger || u.avatarMedium) {
        const avatarUrl = u.avatarLarger || u.avatarMedium;
        try {
          const imgRes  = await fetch(avatarUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const imgBuf  = Buffer.from(await imgRes.arrayBuffer());
          await sock.sendMessage(jid,
            { image: imgBuf, caption },
            { quoted: msg }
          );
        } catch {
          // If image fetch fails, send text only
          await reply(caption);
        }
      } else {
        await reply(caption);
      }

    } catch (e) {
      await reply(`❌ TikTok profile lookup failed:\n${e.message}`);
    }
  },
};

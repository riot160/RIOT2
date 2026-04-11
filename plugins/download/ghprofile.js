// plugins/download/ghprofile.js
import fetch from 'node-fetch';

export default {
  command: ['ghprofile', 'githubprofile', 'ghp'],
  desc: 'Get GitHub profile info + avatar — .ghprofile <username>',
  category: 'download',

  run: async ({ args, sock, jid, msg, reply }) => {
    const username = (args[0] || '').replace('@', '').trim();
    if (!username)
      return reply('Usage: .ghprofile <username>\nExample: .ghprofile torvalds');

    await reply(`🔍 Looking up GitHub: *@${username}*…`);

    try {
      const res  = await fetch(`https://api.github.com/users/${username}`,
        { headers: { 'User-Agent': 'RIOT-MD' } });
      const d    = await res.json();
      if (d.message === 'Not Found') return reply(`❌ GitHub user *${username}* not found.`);

      const formatNum = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n || 0);

      const caption =
        `🐙 *GitHub Profile*\n` +
        `${'─'.repeat(28)}\n` +
        `👤 Name      : ${d.name || d.login}\n` +
        `🔖 Username  : @${d.login}\n` +
        `📝 Bio       : ${d.bio || 'No bio'}\n` +
        `📍 Location  : ${d.location || '—'}\n` +
        `🏢 Company   : ${d.company || '—'}\n` +
        `${'─'.repeat(28)}\n` +
        `👥 Followers : ${formatNum(d.followers)}\n` +
        `➡️  Following : ${formatNum(d.following)}\n` +
        `📦 Repos     : ${d.public_repos}\n` +
        `⭐ Gists     : ${d.public_gists}\n` +
        `${'─'.repeat(28)}\n` +
        `📅 Joined    : ${new Date(d.created_at).toDateString()}\n` +
        `🔗 Profile   : ${d.html_url}`;

      if (d.avatar_url) {
        const imgRes = await fetch(d.avatar_url);
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        await sock.sendMessage(jid, { image: imgBuf, caption }, { quoted: msg });
      } else {
        await reply(caption);
      }
    } catch (e) {
      await reply('❌ GitHub lookup failed: ' + e.message);
    }
  },
};

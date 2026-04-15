// plugins/info/twitterprofile.js
import fetch from 'node-fetch';
export default {
  command: ['twitterprofile', 'twprofile', 'xprofile'],
  desc: 'Get Twitter/X profile info — .twitterprofile elonmusk',
  category: 'info',
  run: async ({ args, sock, jid, msg, reply }) => {
    const username = (args[0] || '').replace('@', '');
    if (!username) return reply('Usage: .twitterprofile <username>\nExample: .twitterprofile elonmusk');
    await reply(`🔍 Looking up X/Twitter: *@${username}*…`);
    try {
      // Use nitter API (open-source Twitter front-end) as free lookup
      const res = await fetch(
        `https://api.socialcounts.org/twitter-live-follower-count/${username}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }
      );
      const d = await res.json();
      const followers = d?.api_data?.followers_count || d?.followers || '—';
      await reply(
        `🐦 *Twitter / X Profile*\n\n` +
        `🔖 Username  : @${username}\n` +
        `👥 Followers : ${typeof followers === 'number' ? followers.toLocaleString() : followers}\n` +
        `🔗 Profile   : https://x.com/${username}\n\n` +
        `_View full profile on X/Twitter_`
      );
    } catch {
      await reply(
        `🐦 *Twitter / X: @${username}*\n\n` +
        `🔗 Profile: https://x.com/${username}\n\n` +
        `_Tap the link to view the full profile_`
      );
    }
  },
};

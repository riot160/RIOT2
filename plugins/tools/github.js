// plugins/tools/github.js
import fetch from 'node-fetch';

export default {
  command: ['github', 'gh'],
  desc: 'Get GitHub user or repo info — .github <user>  or  .github <user/repo>',
  category: 'tools',
  run: async ({ args, reply }) => {
    const input = args[0];
    if (!input) return reply('Usage:\n.github <username>\n.github <username/repo>');
    try {
      const isRepo = input.includes('/');
      const url    = isRepo
        ? `https://api.github.com/repos/${input}`
        : `https://api.github.com/users/${input}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'RIOT-MD' } });
      const d   = await res.json();
      if (d.message === 'Not Found') return reply(`❌ Not found: *${input}*`);
      if (isRepo) {
        await reply(
`📦 *${d.full_name}*

📝 ${d.description || 'No description'}
⭐ Stars   : ${d.stargazers_count?.toLocaleString()}
🍴 Forks   : ${d.forks_count?.toLocaleString()}
🐛 Issues  : ${d.open_issues_count}
💻 Language: ${d.language || 'Unknown'}
🔒 Private : ${d.private ? 'Yes' : 'No'}
🌐 Link    : ${d.html_url}`
        );
      } else {
        await reply(
`👤 *${d.name || d.login}*  (@${d.login})

📝 ${d.bio || 'No bio'}
👥 Followers : ${d.followers?.toLocaleString()}
👣 Following : ${d.following?.toLocaleString()}
📦 Repos     : ${d.public_repos}
🌐 Link      : ${d.html_url}`
        );
      }
    } catch {
      await reply('❌ GitHub API request failed.');
    }
  },
};

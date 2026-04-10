// plugins/owner/repo.js
import { config } from '../../config.js';

export default {
  command: ['repo', 'source', 'code'],
  desc: 'Show the bot GitHub repository link',
  category: 'owner',
  run: async ({ reply }) => {
    await reply(
      `┏▣ ◈ *RIOT MD REPO* ◈\n` +
      `┃\n` +
      `┃ 🤖 Bot     : ${config.BOT_NAME}\n` +
      `┃ 👤 Dev     : ${config.DEVELOPER}\n` +
      `┃ 📦 Version : ${config.BOT_VERSION}\n` +
      `┃ 🟢 Node    : ${process.version}\n` +
      `┃\n` +
      `┃ 📂 *GitHub Repo*\n` +
      `┃ https://github.com/riot160/RIOT2\n` +
      `┃\n` +
      `┃ ⭐ Star the repo if you enjoy RIOT MD!\n` +
      `┗▣`
    );
  },
};

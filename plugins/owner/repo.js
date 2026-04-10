// plugins/owner/repo.js
import { config } from '../../config.js';

export default {
  command: ['repo', 'source', 'github'],
  desc: 'Show the bot repository and source info',
  category: 'owner',
  run: async ({ reply }) => {
    await reply(
      `┏▣ ◈ *RIOT MD REPO* ◈\n` +
      `┃\n` +
      `┃ 🤖 Bot     : ${config.BOT_NAME}\n` +
      `┃ 👤 Dev     : ${config.DEVELOPER}\n` +
      `┃ 📦 Version : ${config.BOT_VERSION}\n` +
      `┃ 🟢 Node    : ${process.version}\n` +
      `┃ 🔧 Library : @whiskeysockets/baileys\n` +
      `┃\n` +
      `┃ 📂 *Source Code*\n` +
      `┃ https://github.com/Dark-Xploit/CypherX\n` +
      `┃\n` +
      `┃ ⭐ Star the repo if you enjoy the bot!\n` +
      `┗▣`
    );
  },
};

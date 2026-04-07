// plugins/owner/info.js
import { config }     from '../../config.js';
import { pluginList } from '../../lib/commands.js';
import { getSessionStats } from '../../lib/session.js';

export default {
  command: ['info', 'botinfo', 'about'],
  desc: 'Show bot information and stats',
  category: 'owner',
  run: async ({ reply }) => {
    const mem   = process.memoryUsage();
    const up    = process.uptime();
    const stats = getSessionStats();
    await reply(
`\`\`\`
⚡ RIOT MD — BOT INFO
${'─'.repeat(30)}
🤖 Name      : ${config.BOT_NAME}
🏷️  Version   : ${config.BOT_VERSION}
👤 Developer : ${config.DEVELOPER}
⚙️  Mode       : ${config.MODE}
🔑 Prefix    : ${config.PREFIX}
🟢 Node.js   : ${process.version}
${'─'.repeat(30)}
⏱️  Uptime    : ${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m
📦 RAM       : ${(mem.heapUsed/1024/1024).toFixed(1)} MB
🧩 Commands  : ${pluginList.length}
🔗 Sessions  : ${stats.connected} connected / ${stats.total} total
\`\`\``
    );
  },
};

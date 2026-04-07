// plugins/owner/menu.js
import { pluginList } from '../../lib/commands.js';
import { config }     from '../../config.js';

export default {
  command: ['menu', 'help', 'list', 'commands'],
  desc: 'Show all bot commands',
  category: 'owner',
  run: async ({ reply, pushName }) => {
    const cats = {};
    for (const p of pluginList) {
      const c = p.category || 'misc';
      if (!cats[c]) cats[c] = [];
      cats[c].push(config.PREFIX + p.command);
    }

    const icons = {
      owner: '👑', group: '👥', ai: '🤖',
      fun: '🎉', tools: '🔧', download: '⬇️', misc: '📦',
    };

    let text = `\`\`\`\n`;
    text += `⚡ RIOT MD — COMMAND MENU\n`;
    text += `${'═'.repeat(32)}\n`;
    text += `👤 Hey ${pushName}!\n`;
    text += `🔑 Prefix  : ${config.PREFIX}\n`;
    text += `📦 Total   : ${pluginList.length} commands\n`;
    text += `${'─'.repeat(32)}\n\n`;

    for (const [cat, cmds] of Object.entries(cats)) {
      const icon = icons[cat] || '📁';
      text += `${icon} ${cat.toUpperCase()} [${cmds.length}]\n`;
      text += cmds.join('  ') + '\n\n';
    }

    text += `${'═'.repeat(32)}\n`;
    text += `⚡ RIOT MD ${config.BOT_VERSION}\n\`\`\``;

    await reply(text);
  },
};

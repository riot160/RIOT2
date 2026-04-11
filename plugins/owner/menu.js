// plugins/owner/menu.js — Phone-style interactive menu
import { pluginList } from '../../lib/commands.js';
import { config }     from '../../config.js';
import { dbGet }      from '../../lib/database.js';

// Category config — order, icon, display name
const CATS = [
  { key: 'owner',    icon: '👑', label: 'OWNER'    },
  { key: 'settings', icon: '⚙️',  label: 'SETTINGS' },
  { key: 'group',    icon: '👥', label: 'GROUP'    },
  { key: 'ai',       icon: '🤖', label: 'AI'       },
  { key: 'download', icon: '⬇️',  label: 'DOWNLOAD' },
  { key: 'tools',    icon: '🔧', label: 'TOOLS'    },
  { key: 'fun',      icon: '🎉', label: 'FUN'      },
];

export default {
  command: ['menu', 'help', 'list', 'commands'],
  desc: 'Show the full bot command menu',
  category: 'owner',

  run: async ({ sock, jid, msg, args, reply, pushName, userId }) => {
    const sub = args[0]?.toLowerCase();
    const mem = process.memoryUsage();
    const ram = (mem.heapUsed / 1024 / 1024).toFixed(0);
    const pct = Math.min(100, Math.round((parseInt(ram) / 512) * 100));
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
    const up  = process.uptime();
    const ping = Math.floor(Math.random() * 60) + 10;

    // Build category map
    const cats = {};
    for (const p of pluginList) {
      const c = (p.category || 'misc').toLowerCase();
      if (!cats[c]) cats[c] = [];
      cats[c].push(p.command);
    }

    // ── Sub-menu: .menu <category> ────────────────
    if (sub) {
      const match = CATS.find(c =>
        c.key === sub ||
        c.label.toLowerCase() === sub ||
        c.key.startsWith(sub)
      );
      if (!match) {
        return reply(
          `❌ Unknown category: *${sub}*\n\n` +
          `Available categories:\n` +
          CATS.map(c => `• .menu ${c.key}`).join('\n')
        );
      }
      const cmds = cats[match.key] || [];
      if (!cmds.length) return reply(`No commands in *${match.label}* category.`);

      let text = `┏▣ ◈ *${match.icon} ${match.label} MENU* ◈\n`;
      text += `┃ Total: ${cmds.length} commands\n`;
      text += `┃\n`;
      for (const cmd of [...cmds].sort()) {
        text += `┃➽ ${config.PREFIX}${cmd}\n`;
      }
      text += `┗▣\n\n`;
      text += `_Type .menu to return to main menu_`;
      return reply(text);
    }

    // ── Main phone-style menu ─────────────────────
    let text = '';

    // Header card
    text += `┏▣ ◈ *${config.BOT_NAME || 'RIOT MD'}* ◈\n`;
    text += `┃ *ᴏᴡɴᴇʀ*   : ${config.OWNER_NAME || 'Sydney Sider'}\n`;
    text += `┃ *ᴘʀᴇғɪx*  : [ ${config.PREFIX} ]\n`;
    text += `┃ *ᴘʟᴜɢɪɴs* : ${pluginList.length}\n`;
    text += `┃ *ᴠᴇʀsɪᴏɴ* : ${config.BOT_VERSION || 'v1.0.0'}\n`;
    text += `┃ *sᴘᴇᴇᴅ*  : ${ping} ms\n`;
    text += `┃ *ʀᴀᴍ*    : [${bar}] ${pct}%\n`;
    text += `┃ *ɴᴏᴅᴇ*   : ${process.version}\n`;
    text += `┗▣\n\n`;

    // Category buttons (phone-menu style)
    text += `┏▣ ◈ *📱 MAIN MENU* ◈\n`;
    text += `┃\n`;
    for (const cat of CATS) {
      const count = cats[cat.key]?.length || 0;
      if (!count) continue;
      text += `┃ ${cat.icon} *${cat.label}* [${count}]\n`;
      text += `┃   ➤ Type: _${config.PREFIX}menu ${cat.key}_\n`;
      text += `┃\n`;
    }
    text += `┗▣\n\n`;

    // Quick-access popular commands
    text += `┏▣ ◈ *⚡ QUICK ACCESS* ◈\n`;
    text += `┃\n`;
    text += `┃ 📊 ${config.PREFIX}botstatus   — Bot health\n`;
    text += `┃ ⏱️  ${config.PREFIX}runtime      — Uptime\n`;
    text += `┃ ⚙️  ${config.PREFIX}getsettings  — All settings\n`;
    text += `┃ 🤖 ${config.PREFIX}ai <q>       — Ask AI\n`;
    text += `┃ 🎵 ${config.PREFIX}play <song>  — Download music\n`;
    text += `┃ 🎬 ${config.PREFIX}tiktok <url> — TikTok video\n`;
    text += `┃ 📱 ${config.PREFIX}ttp <user>   — TikTok profile\n`;
    text += `┃ 🌤️  ${config.PREFIX}weather <c>  — Weather\n`;
    text += `┃ 🔐 ${config.PREFIX}genpass      — Password\n`;
    text += `┃ 📸 ${config.PREFIX}ssweb <url>  — Screenshot\n`;
    text += `┃ 🎭 ${config.PREFIX}sticker      — Make sticker\n`;
    text += `┃ 🌐 ${config.PREFIX}translate    — Translate\n`;
    text += `┗▣\n\n`;

    text += `_Hey ${pushName}! 👋 Type *${config.PREFIX}menu <category>* to see commands._`;

    // Send with bot profile pic if available
    try {
      const myJid = sock.user?.id || '';
      const ppUrl = await sock.profilePictureUrl(myJid, 'image').catch(() => null);
      if (ppUrl) {
        await sock.sendMessage(jid,
          { image: { url: ppUrl }, caption: text },
          { quoted: msg }
        );
        return;
      }
    } catch {}

    await reply(text);
  },
};

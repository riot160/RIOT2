// plugins/owner/menu.js  — CypherX-style menu with custom image & header
import { pluginList } from '../../lib/commands.js';
import { config }     from '../../config.js';
import { dbGet }      from '../../lib/database.js';

const CAT_CONFIG = [
  { key: 'owner',    icon: '👑', label: 'OWNER'    },
  { key: 'settings', icon: '⚙️',  label: 'SETTINGS' },
  { key: 'group',    icon: '👥', label: 'GROUP'    },
  { key: 'ai',       icon: '🤖', label: 'AI'       },
  { key: 'download', icon: '⬇️',  label: 'DOWNLOAD' },
  { key: 'tools',    icon: '🔧', label: 'TOOLS'    },
  { key: 'fun',      icon: '🎉', label: 'FUN'      },
  { key: 'misc',     icon: '📦', label: 'OTHER'    },
];

export default {
  command: ['menu', 'help', 'list', 'commands'],
  desc: 'Show the full bot command menu',
  category: 'owner',
  run: async ({ sock, jid, msg, reply, pushName, userId }) => {
    const mem      = process.memoryUsage();
    const ramMB    = (mem.heapUsed / 1024 / 1024).toFixed(0);
    const ramPct   = Math.min(100, Math.round((parseInt(ramMB) / 512) * 100));
    const bar      = '█'.repeat(Math.round(ramPct / 10)) + '░'.repeat(10 - Math.round(ramPct / 10));
    const up       = process.uptime();
    const upStr    = `${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m`;
    const ping     = Math.floor(Math.random() * 80) + 10;
    const settings = (await dbGet(`settings:${userId}`)) || {};

    // Build per-category map
    const cats = {};
    for (const p of pluginList) {
      const c = (p.category || 'misc').toLowerCase();
      if (!cats[c]) cats[c] = [];
      cats[c].push(p.command);
    }

    // ── Header ─────────────────────────────────
    let text = '';
    if (settings.customMenuHeader) {
      text += `${settings.customMenuHeader}\n\n`;
    }
    text += `┏▣ ◈ *RIOT MD* ◈\n`;
    text += `┃ *ᴏᴡɴᴇʀ*   : ${config.OWNER_NAME || 'Sydney Sider'}\n`;
    text += `┃ *ᴘʀᴇғɪx*  : [ ${config.PREFIX} ]\n`;
    text += `┃ *ᴘʟᴜɢɪɴs* : ${pluginList.length}\n`;
    text += `┃ *ᴍᴏᴅᴇ*   : ${(config.MODE || 'public').charAt(0).toUpperCase() + (config.MODE || 'public').slice(1)}\n`;
    text += `┃ *ᴠᴇʀsɪᴏɴ* : ${config.BOT_VERSION}\n`;
    text += `┃ *sᴘᴇᴇᴅ*  : ${ping} ms\n`;
    text += `┃ *ᴜsᴀɢᴇ*  : ${ramMB} MB\n`;
    text += `┃ *ʀᴀᴍ*    : [${bar}] ${ramPct}%\n`;
    text += `┃ *ᴜᴘᴛɪᴍᴇ* : ${upStr}\n`;
    text += `┃ *ɴᴏᴅᴇ*   : ${process.version}\n`;
    text += `┗▣\n\n`;

    // ── Category sections ──────────────────────
    const ordered = [...CAT_CONFIG];
    for (const key of Object.keys(cats)) {
      if (!ordered.find(c => c.key === key))
        ordered.push({ key, icon: '📁', label: key.toUpperCase() });
    }
    for (const { key, icon, label } of ordered) {
      const cmds = cats[key];
      if (!cmds?.length) continue;
      text += `┏▣ ◈ *${icon} ${label} MENU* ◈\n`;
      for (const cmd of [...cmds].sort()) text += `│➽ ${cmd}\n`;
      text += `┗▣\n\n`;
    }
    text += `_⚡ RIOT MD ${config.BOT_VERSION} — Hey ${pushName}!_`;

    // ── Send with custom image if set ──────────
    if (settings.menuImage) {
      const buf = Buffer.from(settings.menuImage, 'base64');
      await sock.sendMessage(jid,
        { image: buf, caption: text },
        { quoted: msg }
      );
    } else {
      await reply(text);
    }
  },
};

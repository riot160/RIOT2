// plugins/owner/menu.js — CypherX style + custom image
import { pluginList } from '../../lib/commands.js';
import { config }     from '../../config.js';
import { dbGet }      from '../../lib/database.js';

const MENU_IMAGE = 'https://files.catbox.moe/8mfumm.png';

const CAT_CONFIG = [
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

  run: async ({ sock, jid, msg, reply, pushName, userId }) => {
    const mem    = process.memoryUsage();
    const ramMB  = (mem.heapUsed / 1024 / 1024).toFixed(0);
    const ramPct = Math.min(100, Math.round((parseInt(ramMB) / 512) * 100));
    const bar    = '█'.repeat(Math.round(ramPct / 10)) + '░'.repeat(10 - Math.round(ramPct / 10));
    const ping   = Math.floor(Math.random() * 60) + 10;
    const s      = (await dbGet(`settings:${userId}`)) || {};

    const cats = {};
    for (const p of pluginList) {
      const c = (p.category || 'misc').toLowerCase();
      if (!cats[c]) cats[c] = [];
      cats[c].push(p.command);
    }

    let text = '';
    text += `┏▣ ◈ *${config.BOT_NAME || 'RIOT MD'}* ◈\n`;
    text += `┃ *ᴏᴡɴᴇʀ*   : ${config.OWNER_NAME || 'Sydney Sider'}\n`;
    text += `┃ *ᴘʀᴇғɪx*  : [ ${config.PREFIX} ]\n`;
    text += `┃ *ᴘʟᴜɢɪɴs* : ${pluginList.length}\n`;
    text += `┃ *ᴍᴏᴅᴇ*   : ${(s.mode || config.MODE || 'Public').charAt(0).toUpperCase() + (s.mode || config.MODE || 'public').slice(1)}\n`;
    text += `┃ *ᴠᴇʀsɪᴏɴ* : ${config.BOT_VERSION || 'v1.0.0'}\n`;
    text += `┃ *sᴘᴇᴇᴅ*  : ${ping} ms\n`;
    text += `┃ *ᴜsᴀɢᴇ*  : ${ramMB} MB\n`;
    text += `┃ *ʀᴀᴍ*    : [${bar}] ${ramPct}%\n`;
    text += `┃ *ɴᴏᴅᴇ*   : ${process.version}\n`;
    text += `┗▣\n\n`;

    const ordered = [...CAT_CONFIG];
    for (const key of Object.keys(cats)) {
      if (!ordered.find(c => c.key === key))
        ordered.push({ key, icon: '📁', label: key.toUpperCase() });
    }

    for (const { key, icon, label } of ordered) {
      const cmds = cats[key];
      if (!cmds?.length) continue;
      text += `┏▣ ◈ *${icon} ${label} MENU* ◈\n`;
      for (const cmd of [...cmds].sort()) {
        text += `│➽ ${config.PREFIX}${cmd}\n`;
      }
      text += `┗▣\n\n`;
    }

    text += `_⚡ ${config.BOT_NAME || 'RIOT MD'} — Hey ${pushName}! 👋_`;

    try {
      await sock.sendMessage(jid,
        { image: { url: MENU_IMAGE }, caption: text },
        { quoted: msg }
      );
    } catch {
      await reply(text);
    }
  },
};

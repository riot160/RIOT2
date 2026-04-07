// ═══════════════════════════════════════════════════
//  RIOT MD - MENU PLUGIN
//  CYPHER-X style layout
// ═══════════════════════════════════════════════════

import { pluginList } from '../../lib/commands.js';
import { config }     from '../../config.js';
import { botSettings } from '../../lib/handler.js';
import os from 'os';

// ── Category display order & icons ────────────────
const CATEGORY_ORDER = [
  'ai', 'audio', 'download', 'fun', 'games',
  'group', 'image', 'other', 'owner',
  'search', 'settings', 'tools', 'translate',
];

const CATEGORY_ICONS = {
  ai:         '🤖',
  audio:      '🎵',
  download:   '⬇️',
  fun:        '🎉',
  games:      '🎮',
  group:      '👥',
  image:      '🖼️',
  other:      '📦',
  owner:      '👑',
  search:     '🔍',
  settings:   '⚙️',
  tools:      '🔧',
  translate:  '🌐',
};

function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}

function ramBar(usedPct) {
  const filled = Math.round(usedPct / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

export default {
  command: ['menu', 'help', 'list', 'commands'],
  desc: 'Show all bot commands in styled menu',
  category: 'other',
  run: async ({ reply, pushName, sock }) => {
    const prefix = config.PREFIX;
    const start  = Date.now();

    // ── Collect & group commands ──
    const cats = {};
    for (const p of pluginList) {
      const cat = (p.category || 'other').toLowerCase();
      if (!cats[cat]) cats[cat] = [];
      // support multi-command arrays
      const cmds = Array.isArray(p.command) ? p.command : [p.command];
      cats[cat].push(...cmds);
    }

    // ── System stats ──
    const totalMem  = os.totalmem();
    const freeMem   = os.freemem();
    const usedMem   = totalMem - freeMem;
    const usedPct   = Math.round((usedMem / totalMem) * 100);
    const speed     = (Date.now() - start).toFixed(4);
    const upSec     = process.uptime();
    const uptime    = `${Math.floor(upSec / 3600)}h ${Math.floor((upSec % 3600) / 60)}m`;
    const totalCmds = pluginList.length;
    const mode      = (config.MODE || 'public').charAt(0).toUpperCase() + config.MODE.slice(1);

    const s = botSettings;
    const st = (v) => v ? '✅' : '❌';

    // ── Header card ──────────────────────────────
    let text = '';
    text +=
      `┏▣ ◈ *${config.BOT_NAME.toUpperCase()}* ◈\n` +
      `┃\n` +
      `┃ *ᴏᴡɴᴇʀ*    : ${config.OWNER_NAME || 'Not Set!'}\n` +
      `┃ *ᴘʀᴇғɪx*   : [ ${prefix} ]\n` +
      `┃ *ᴘʟᴜɢɪɴs*  : ${totalCmds}\n` +
      `┃ *ᴍᴏᴅᴇ*     : ${mode}\n` +
      `┃ *ᴠᴇʀsɪᴏɴ*  : ${config.BOT_VERSION}\n` +
      `┃ *sᴘᴇᴇᴅ*    : ${speed} ms\n` +
      `┃ *ᴜsᴀɢᴇ*    : ${formatBytes(usedMem)} of ${formatBytes(totalMem)}\n` +
      `┃ *ᴜᴘᴛɪᴍᴇ*   : ${uptime}\n` +
      `┃ *ʀᴀᴍ*      : [${ramBar(usedPct)}] ${usedPct}%\n` +
      `┗▣\n\n`;

    // ── Settings status card ──────────────────────
    text +=
      `┏▣ ◈ *⚙️ ACTIVE SETTINGS* ◈\n` +
      `┃\n` +
      `┃ ${st(s.autoread)}  Auto Read\n` +
      `┃ ${st(s.autotyping)}  Auto Typing\n` +
      `┃ ${st(s.autoviewstatus)}  Auto View Status\n` +
      `┃ ${st(s.autoreactstatus)}  Auto React Status\n` +
      `┃ ${st(s.antidelete)}  Anti Delete\n` +
      `┃ ${st(s.antideletestatus)}  Anti Delete Status\n` +
      `┗▣\n\n`;

    // ── Command category sections ─────────────────
    const orderedKeys = [
      ...CATEGORY_ORDER.filter(k => cats[k]),
      ...Object.keys(cats).filter(k => !CATEGORY_ORDER.includes(k)).sort(),
    ];

    for (const cat of orderedKeys) {
      const cmds   = [...new Set(cats[cat])].sort();
      const icon   = CATEGORY_ICONS[cat] || '📁';
      const label  = cat.toUpperCase();

      text += `┏▣ ◈ *${icon} ${label} MENU* ◈\n`;
      text += `┃\n`;
      for (const cmd of cmds) {
        text += `│➽ ${cmd}\n`;
      }
      text += `┗▣\n\n`;
    }

    // ── Footer ────────────────────────────────────
    text +=
      `> 💡 *Usage:* ${prefix}<command> [args]\n` +
      `> 📖 *Help:* ${prefix}help <command>\n` +
      `> ⚡ *${config.BOT_NAME} ${config.BOT_VERSION}* — Ready!`;

    await reply(text);
  },
};

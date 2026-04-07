// ═══════════════════════════════════════════════════
//  RIOT MD  ·  SETTINGS COMMANDS
//  All features stored per-session in DB
//  Usage: .autoread on/off  .autotyping on/off  etc.
// ═══════════════════════════════════════════════════
import { dbGet, dbSet } from '../../lib/database.js';
import { config }       from '../../config.js';

// ── helper: get/save settings for a session ───────
async function getSettings(userId) {
  return (await dbGet(`settings:${userId}`)) || {};
}
async function saveSettings(userId, s) {
  return dbSet(`settings:${userId}`, s);
}

// ── helper: toggle factory ─────────────────────────
function makeToggle(key, label, onMsg, offMsg) {
  return {
    command: key,
    desc: `Toggle ${label} on or off`,
    category: 'settings',
    owner: true,
    run: async ({ args, userId, reply }) => {
      const val = args[0]?.toLowerCase();
      if (!['on','off'].includes(val))
        return reply(`Usage: .${key} on\n       .${key} off`);
      const s = await getSettings(userId);
      s[key]  = val === 'on';
      await saveSettings(userId, s);
      await reply(val === 'on' ? onMsg : offMsg);
    },
  };
}

// ══════════════════════════════════════════════════
//  INDIVIDUAL TOGGLE EXPORTS
// ══════════════════════════════════════════════════

export const autoread = makeToggle(
  'autoread', 'Auto Read',
  '👁️ *Auto Read* → *ON*\nMessages will be marked as read automatically.',
  '👁️ *Auto Read* → *OFF*\nMessages will NOT be auto-read.'
);

export const autotyping = makeToggle(
  'autotyping', 'Auto Typing',
  '⌨️ *Auto Typing* → *ON*\nBot will show typing indicator before replies.',
  '⌨️ *Auto Typing* → *OFF*\nTyping indicator disabled.'
);

export const autoviewstatus = makeToggle(
  'autoviewstatus', 'Auto View Status',
  '👀 *Auto View Status* → *ON*\nBot will automatically view all WhatsApp statuses.',
  '👀 *Auto View Status* → *OFF*\nStatuses will NOT be auto-viewed.'
);

export const autoreactstatus = makeToggle(
  'autoreactstatus', 'Auto React Status',
  '🔥 *Auto React Status* → *ON*\nBot will react to every status it sees.',
  '🔥 *Auto React Status* → *OFF*\nStatus reactions disabled.'
);

export const autosavestatus = makeToggle(
  'autosavestatus', 'Auto Save Status',
  '💾 *Auto Save Status* → *ON*\nMedia statuses will be forwarded to your DM.',
  '💾 *Auto Save Status* → *OFF*\nAuto-save disabled.'
);

export const antidelete = makeToggle(
  'antidelete', 'Anti Delete',
  '🛡️ *Anti Delete* → *ON*\nDeleted messages will be re-sent to the chat.',
  '🛡️ *Anti Delete* → *OFF*\nDeleted messages will be ignored.'
);

export const antideletestatus = makeToggle(
  'antideletestatus', 'Anti Delete Status',
  '🛡️ *Anti Delete Status* → *ON*\nDeleted statuses will be saved before they disappear.',
  '🛡️ *Anti Delete Status* → *OFF*\nDeleted status protection disabled.'
);

export const anticall = makeToggle(
  'anticall', 'Anti Call',
  '📵 *Anti Call* → *ON*\nAll incoming calls will be automatically rejected.',
  '📵 *Anti Call* → *OFF*\nIncoming calls will be allowed.'
);

export const antiedit = makeToggle(
  'antiedit', 'Anti Edit',
  '✏️ *Anti Edit* → *ON*\nOriginal message shown when someone edits theirs.',
  '✏️ *Anti Edit* → *OFF*\nEdited message detection disabled.'
);

export const autorecord = makeToggle(
  'autorecord', 'Auto Record',
  '🎙️ *Auto Record* → *ON*\nBot will show recording status while composing audio.',
  '🎙️ *Auto Record* → *OFF*\nRecording status disabled.'
);

export const alwaysonline = makeToggle(
  'alwaysonline', 'Always Online',
  '🟢 *Always Online* → *ON*\nBot will always appear online.',
  '🟢 *Always Online* → *OFF*\nOnline presence follows normal behaviour.'
);

export const antibug = makeToggle(
  'antibug', 'Anti Bug',
  '🐛 *Anti Bug* → *ON*\nBug/crash messages will be filtered out.',
  '🐛 *Anti Bug* → *OFF*\nAnti-bug filter disabled.'
);

export const chatbot = makeToggle(
  'chatbot', 'Chatbot',
  '🤖 *Chatbot* → *ON*\nBot will reply to all non-command messages with AI.',
  '🤖 *Chatbot* → *OFF*\nAI chatbot disabled, only commands work.'
);

// ══════════════════════════════════════════════════
//  STATUS EMOJI SETTER
// ══════════════════════════════════════════════════
export const setstatusemoji = {
  command: ['setstatusemoji', 'statusemoji'],
  desc: 'Set emoji used for auto-react to statuses',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const emoji = args[0];
    if (!emoji) return reply('Usage: .setstatusemoji 🔥\nDefault is 🔥');
    const s = await getSettings(userId);
    s.statusEmoji = emoji;
    await saveSettings(userId, s);
    await reply(`✅ Status react emoji set to: ${emoji}`);
  },
};

// ══════════════════════════════════════════════════
//  VIEW ALL SETTINGS
// ══════════════════════════════════════════════════
export const getsettings = {
  command: ['getsettings', 'settings', 'mysettings'],
  desc: 'View all current bot settings',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    const s    = await getSettings(userId);
    const icon = (val) => val ? '✅ ON' : '❌ OFF';
    await reply(
`┏▣ ◈ *RIOT MD SETTINGS* ◈
┃
┃ ⌨️  *autoread*        : ${icon(s.autoread        !== false)}
┃ ⌨️  *autotyping*      : ${icon(s.autotyping      !== false)}
┃ 🟢 *alwaysonline*    : ${icon(s.alwaysonline)}
┃ 📵 *anticall*        : ${icon(s.anticall)}
┃ 🛡️  *antidelete*     : ${icon(s.antidelete)}
┃ 🛡️  *antideletestatus*: ${icon(s.antideletestatus)}
┃ ✏️  *antiedit*        : ${icon(s.antiedit)}
┃ 🐛 *antibug*         : ${icon(s.antibug)}
┃ 👀 *autoviewstatus*  : ${icon(s.autoviewstatus)}
┃ 🔥 *autoreactstatus* : ${icon(s.autoreactstatus)}
┃ 💾 *autosavestatus*  : ${icon(s.autosavestatus)}
┃ 🎙️  *autorecord*      : ${icon(s.autorecord)}
┃ 🤖 *chatbot*         : ${icon(s.chatbot)}
┃ 😀 *statusEmoji*     : ${s.statusEmoji || '🔥'}
┗▣`
    );
  },
};

// ══════════════════════════════════════════════════
//  RESET ALL SETTINGS
// ══════════════════════════════════════════════════
export const resetsettings = {
  command: ['resetsettings', 'resetsetting'],
  desc: 'Reset all settings back to default',
  category: 'settings',
  owner: true,
  run: async ({ userId, reply }) => {
    await saveSettings(userId, {});
    await reply('♻️ *All settings reset to default.*');
  },
};

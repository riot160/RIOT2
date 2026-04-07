// ═══════════════════════════════════════════════════
//  RIOT MD - SETTINGS PLUGIN
//  All toggleable bot features
// ═══════════════════════════════════════════════════

import { botSettings } from '../../lib/handler.js';

// ── Helper: toggle + reply ─────────────────────────
function toggle(ctx, key, label) {
  botSettings[key] = !botSettings[key];
  const state = botSettings[key] ? '✅ *ON*' : '❌ *OFF*';
  return ctx.reply(
    `┏━━━━━━━━━━━━━━━━━━━━━━┓\n` +
    `┃  ⚙️  *RIOT MD SETTINGS*\n` +
    `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
    `🔧 *${label}*\n` +
    `📌 Status : ${state}\n\n` +
    `_Use the same command to toggle again._`
  );
}

// ── autoread ──────────────────────────────────────
export const autoread = {
  command: ['autoread'],
  desc: 'Toggle auto-read messages (blue ticks)',
  category: 'settings',
  owner: true,
  run: (ctx) => toggle(ctx, 'autoread', 'Auto Read Messages'),
};

// ── autotyping ────────────────────────────────────
export const autotyping = {
  command: ['autotyping', 'autotype'],
  desc: 'Toggle typing indicator when processing commands',
  category: 'settings',
  owner: true,
  run: (ctx) => toggle(ctx, 'autotyping', 'Auto Typing Indicator'),
};

// ── autoviewstatus ────────────────────────────────
export const autoviewstatus = {
  command: ['autoviewstatus'],
  desc: 'Toggle auto-view WhatsApp statuses',
  category: 'settings',
  owner: true,
  run: (ctx) => toggle(ctx, 'autoviewstatus', 'Auto View Status'),
};

// ── autoreactstatus ───────────────────────────────
export const autoreactstatus = {
  command: ['autoreactstatus'],
  desc: 'Toggle auto-react to WhatsApp statuses with random emoji',
  category: 'settings',
  owner: true,
  run: (ctx) => toggle(ctx, 'autoreactstatus', 'Auto React to Status'),
};

// ── antidelete ────────────────────────────────────
export const antidelete = {
  command: ['antidelete'],
  desc: 'Toggle anti-delete (re-send deleted messages)',
  category: 'settings',
  owner: true,
  run: (ctx) => toggle(ctx, 'antidelete', 'Anti Delete (Messages)'),
};

// ── antideletestatus ──────────────────────────────
export const antideletestatus = {
  command: ['antideletestatus'],
  desc: 'Toggle anti-delete for status updates',
  category: 'settings',
  owner: true,
  run: (ctx) => toggle(ctx, 'antideletestatus', 'Anti Delete (Status)'),
};

// ── getsettings ───────────────────────────────────
export default {
  command: ['getsettings', 'settings', 'botconfig'],
  desc: 'Show all current bot settings',
  category: 'settings',
  owner: true,
  run: async ({ reply }) => {
    const s = botSettings;
    const st = (v) => v ? '✅ ON' : '❌ OFF';

    const text =
      `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
      `┃   ⚙️  *RIOT MD — BOT SETTINGS*\n` +
      `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
      `📖 *AUTO READ*          → ${st(s.autoread)}\n` +
      `⌨️  *AUTO TYPING*        → ${st(s.autotyping)}\n` +
      `👁️  *AUTO VIEW STATUS*   → ${st(s.autoviewstatus)}\n` +
      `💬 *AUTO REACT STATUS*  → ${st(s.autoreactstatus)}\n` +
      `🗑️  *ANTI DELETE*        → ${st(s.antidelete)}\n` +
      `📸 *ANTI DELETE STATUS* → ${st(s.antideletestatus)}\n\n` +
      `_Use the command name to toggle any setting._`;

    await reply(text);
  },
};

// plugins/settings/setfont.js
import { dbGet, dbSet } from '../../lib/database.js';

// Unicode font converters
const FONTS = {
  bold:    t => t.replace(/[a-z]/g, c => String.fromCodePoint(c.charCodeAt(0) - 97 + 0x1D41A))
                 .replace(/[A-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1D400)),
  italic:  t => t.replace(/[a-z]/g, c => String.fromCodePoint(c.charCodeAt(0) - 97 + 0x1D44E))
                 .replace(/[A-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1D434)),
  mono:    t => t.replace(/[a-zA-Z0-9]/g, c => String.fromCodePoint(c.charCodeAt(0) - 33 + 0x1D670)),
  normal:  t => t,
};

export default {
  command: 'setfont',
  desc: 'Change bot reply text style — .setfont bold/italic/mono/normal',
  category: 'settings',
  owner: true,
  run: async ({ args, userId, reply }) => {
    const font = args[0]?.toLowerCase();
    const available = Object.keys(FONTS);
    if (!font || !available.includes(font))
      return reply(
        `Usage: .setfont <style>\n\nAvailable styles:\n` +
        available.map(f => `• *${f}*  →  ${FONTS[f]('Sample Text')}`).join('\n')
      );
    const s = (await dbGet(`settings:${userId}`)) || {};
    s.font = font;
    await dbSet(`settings:${userId}`, s);
    await reply(`✅ *Font Style Set*\n\nStyle: *${font}*\nPreview: ${FONTS[font]('Hello from RIOT MD!')}`);
  },
};

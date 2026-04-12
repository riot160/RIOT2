// plugins/download/apk.js
import fetch from 'node-fetch';

export default {
  command: ['apk', 'getapk'],
  desc: 'Search and get APK download info — .apk WhatsApp',
  category: 'download',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .apk <app name>\nExample: .apk WhatsApp');
    await reply(`📦 Searching APK: *${text}*…`);
    try {
      const res  = await fetch(
        `https://api.apkmirror.com/v2/search/?q=${encodeURIComponent(text)}&limit=3`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' } }
      );
      // Fallback: use APKPure search scraper
      const res2 = await fetch(
        `https://apkpure.com/search?q=${encodeURIComponent(text)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );

      await reply(
        `📦 *APK Search: ${text}*\n\n` +
        `🔗 APKPure   : https://apkpure.com/search?q=${encodeURIComponent(text)}\n` +
        `🔗 APKMirror : https://www.apkmirror.com/?post_type=app_release&searchtype=apk&s=${encodeURIComponent(text)}\n` +
        `🔗 APKCombo  : https://apkcombo.com/search/${encodeURIComponent(text)}\n\n` +
        `_Tap any link to download the APK safely_`
      );
    } catch {
      await reply(
        `📦 *APK Search: ${text}*\n\n` +
        `🔗 https://apkpure.com/search?q=${encodeURIComponent(text)}\n` +
        `🔗 https://www.apkmirror.com/?s=${encodeURIComponent(text)}`
      );
    }
  },
};

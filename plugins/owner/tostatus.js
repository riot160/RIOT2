// plugins/owner/tostatus.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  command: ['tostatus', 'poststatus', 'setstatus'],
  desc: 'Post text or quoted media as your WhatsApp status — .tostatus <text>',
  category: 'owner',
  owner: true,
  run: async ({ sock, msg, text, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    try {
      // ── Post media status ──
      if (quoted) {
        const typeMap = { imageMessage: 'image', videoMessage: 'video' };
        const msgKey  = Object.keys(quoted).find(k => typeMap[k]);
        const mt      = typeMap[msgKey];
        if (!msgKey || !mt) return reply('❌ Quote an image or video to post as status.');

        const stream = await downloadContentFromMessage(quoted[msgKey], mt);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buf = Buffer.concat(chunks);

        await sock.sendMessage('status@broadcast', {
          [mt]: buf,
          caption: text || quoted[msgKey]?.caption || '',
        });
        await reply(`✅ *${mt === 'image' ? 'Photo' : 'Video'} status posted!*`);

      // ── Post text status ──
      } else if (text) {
        const BG_COLORS = [
          '#1DA1F2','#E1306C','#25D366','#FF6B35',
          '#7C3AED','#F59E0B','#10B981','#EF4444',
        ];
        const bg = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
        await sock.sendMessage('status@broadcast', {
          text,
          font:            4,
          backgroundColor: bg,
        });
        await reply(`✅ *Text status posted!*\n\n_"${text}"_`);
      } else {
        await reply(
          'Usage:\n' +
          '• .tostatus <text>           → post a text status\n' +
          '• Quote an image/video + .tostatus → post media status\n' +
          '• Quote + .tostatus <caption>       → media with caption'
        );
      }
    } catch (e) {
      await reply('❌ Failed to post status: ' + e.message);
    }
  },
};

// plugins/tools/readqr.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import FormData from 'form-data';
export default {
  command: ['readqr', 'scanqr', 'decodeqr'],
  desc: 'Scan and decode a QR code from an image — reply with .readqr',
  category: 'tools',
  run: async ({ msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
    if (!imgMsg) return reply('Reply to a QR code image with *.readqr* to decode it.');
    await reply('📷 Scanning QR code…');
    try {
      const stream = await downloadContentFromMessage(imgMsg, 'image');
      const chunks = []; for await (const c of stream) chunks.push(c);
      const buf    = Buffer.concat(chunks);
      const form   = new FormData();
      form.append('file', buf, { filename: 'qr.jpg', contentType: 'image/jpeg' });
      const res  = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
        method: 'POST', body: form,
      });
      const d    = await res.json();
      const text = d?.[0]?.symbol?.[0]?.data;
      if (!text) return reply('❌ No QR code detected in the image.');
      await reply(`✅ *QR Code Decoded*\n\n${text}`);
    } catch (e) { await reply('❌ QR scan failed: ' + e.message); }
  },
};

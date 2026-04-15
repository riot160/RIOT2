// plugins/tools/ocr.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import FormData from 'form-data';
export default {
  command: ['ocr', 'readimage', 'extracttext'],
  desc: 'Extract text from a quoted image — reply with .ocr',
  category: 'tools',
  run: async ({ sock, jid, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
    if (!imgMsg) return reply('Reply to an image with *.ocr* to extract text from it.');
    await reply('🔍 Reading text from image…');
    try {
      const stream = await downloadContentFromMessage(imgMsg, 'image');
      const chunks = []; for await (const c of stream) chunks.push(c);
      const buf    = Buffer.concat(chunks);
      // OCR.space free API (no key needed for basic use)
      const form   = new FormData();
      form.append('base64Image', 'data:image/jpeg;base64,' + buf.toString('base64'));
      form.append('language',    'eng');
      form.append('isOverlayRequired', 'false');
      const res  = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { 'apikey': 'helloworld', ...form.getHeaders() },
        body: form,
      });
      const d    = await res.json();
      const text = d.ParsedResults?.[0]?.ParsedText?.trim();
      if (!text) return reply('❌ No text detected in the image.');
      await reply(`📝 *Extracted Text*\n\n${text}`);
    } catch (e) { await reply('❌ OCR failed: ' + e.message); }
  },
};

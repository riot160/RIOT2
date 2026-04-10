// plugins/tools/tourl.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import FormData from 'form-data';

export default {
  command: ['tourl', 'fileurl', 'imgurl'],
  desc: 'Upload quoted image/video and get a direct URL — reply with .tourl',
  category: 'tools',
  run: async ({ msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    if (!quoted)
      return reply('Reply to an image or video with .tourl to get a direct link.');

    const type = quoted.imageMessage   ? 'imageMessage'
               : quoted.videoMessage   ? 'videoMessage'
               : quoted.documentMessage ? 'documentMessage'
               : null;
    if (!type) return reply('❌ Reply to an image, video or document.');

    await reply('⬆️ Uploading…');
    try {
      const mediaType = type.replace('Message', '');
      const stream    = await downloadContentFromMessage(quoted[type], mediaType);
      const chunks    = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buf = Buffer.concat(chunks);

      // Upload to tmpfiles.org (free, no auth needed)
      const form = new FormData();
      form.append('file', buf, { filename: `riot_${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}` });
      const res  = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST', body: form,
      });
      const data = await res.json();
      const url  = data?.data?.url?.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      if (!url) throw new Error('Upload failed');
      await reply(`🔗 *Direct URL*\n\n${url}\n\n_Link expires in 60 minutes_`);
    } catch (e) {
      await reply('❌ Upload failed: ' + e.message);
    }
  },
};

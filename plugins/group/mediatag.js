// plugins/group/mediatag.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  command: 'mediatag',
  desc: 'Tag all members using media — reply to image/video with .mediatag <text>',
  category: 'group',
  group: true,
  admin: true,
  run: async ({ sock, jid, msg, text, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    const type   = quoted?.imageMessage ? 'imageMessage'
                 : quoted?.videoMessage ? 'videoMessage'
                 : null;
    if (!type) return reply('Reply to an image or video with .mediatag <text>');

    const meta     = await sock.groupMetadata(jid);
    const mentions = meta.participants.map(p => p.id);
    const tags     = mentions.map(j => `@${j.split('@')[0]}`).join(' ');

    try {
      const stream = await downloadContentFromMessage(quoted[type], type.replace('Message',''));
      const chunks = []; for await (const c of stream) chunks.push(c);
      const buf    = Buffer.concat(chunks);
      const cap    = text ? `📢 ${text}\n\n${tags}` : `📢 ${tags}`;
      await sock.sendMessage(jid,
        { [type === 'imageMessage' ? 'image' : 'video']: buf, caption: cap, mentions },
      );
    } catch (e) {
      await reply('❌ Media tag failed: ' + e.message);
    }
  },
};

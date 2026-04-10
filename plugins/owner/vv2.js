// plugins/owner/vv2.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  command: ['vv2', 'viewonce', 'unvv'],
  desc: 'Re-send a view-once image/video as a normal message — reply with .vv2',
  category: 'owner',
  owner: true,
  run: async ({ sock, jid, msg, reply }) => {
    const ctx    = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;
    if (!quoted) return reply('Reply to a view-once message with .vv2');

    const voKey = Object.keys(quoted).find(k =>
      quoted[k]?.viewOnce === true ||
      k === 'viewOnceMessage' ||
      k === 'viewOnceMessageV2'
    );

    let mediaMsg = quoted[voKey];
    // Handle nested viewOnceMessageV2 structure
    if (voKey === 'viewOnceMessage' || voKey === 'viewOnceMessageV2') {
      const inner  = mediaMsg?.message;
      const innerK = Object.keys(inner || {})[0];
      mediaMsg = inner?.[innerK];
    }

    if (!mediaMsg) return reply('❌ No view-once media found in that message.');

    const isImage = 'imageMessage' in (quoted[voKey]?.message || quoted) ||
                    voKey?.includes('image') ||
                    mediaMsg?.mimetype?.includes('image');
    const mediaType = isImage ? 'image' : 'video';

    await reply('🔓 Opening view-once…');
    try {
      const stream = await downloadContentFromMessage(mediaMsg, mediaType);
      const chunks = [];
      for await (const c of stream) chunks.push(c);
      const buf = Buffer.concat(chunks);
      await sock.sendMessage(jid,
        { [mediaType]: buf, caption: '🔓 *View-Once Opened*\n_Via RIOT MD_' },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ Failed to open view-once: ' + e.message);
    }
  },
};

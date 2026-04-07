// plugins/ai/qr.js
export default {
  command: ['qr', 'qrcode'],
  desc: 'Generate a QR code — .qr <text or URL>',
  category: 'ai',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .qr <text or URL>');
    try {
      const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=400x400&margin=10`;
      await sock.sendMessage(
        jid,
        { image: { url }, caption: `📱 *QR Code*\n\n${text}` },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ QR generation failed: ' + e.message);
    }
  },
};

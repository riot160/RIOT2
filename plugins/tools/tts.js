// plugins/tools/tts.js
export default {
  command: ['tts', 'speak'],
  desc: 'Convert text to speech audio — .tts <text>',
  category: 'tools',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text) return reply('Usage: .tts <text>\nExample: .tts Hello, welcome to RIOT MD!');
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=gtx`;
      await sock.sendMessage(
        jid,
        { audio: { url }, mimetype: 'audio/mpeg', ptt: true },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ TTS failed: ' + e.message);
    }
  },
};

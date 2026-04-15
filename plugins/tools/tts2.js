// plugins/tools/tts2.js
export default {
  command: ['tts2', 'speak2'],
  desc: 'Text to speech in any language — .tts2 sw Hello  (sw=Swahili)',
  category: 'tools',
  run: async ({ args, sock, jid, msg, reply }) => {
    const lang  = args[0] || 'en';
    const text  = args.slice(1).join(' ');
    if (!text) return reply('Usage: .tts2 <lang_code> <text>\nExamples:\n.tts2 sw Habari yako\n.tts2 fr Bonjour le monde\n.tts2 ar مرحبا');
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=gtx`;
      await sock.sendMessage(jid,
        { audio: { url }, mimetype: 'audio/mpeg', ptt: true },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ TTS failed: ' + e.message);
    }
  },
};

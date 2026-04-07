// plugins/tools/avatar.js
export default {
  command: ['avatar', 'ava'],
  desc: 'Generate a random avatar image — .avatar  or  .avatar <name>',
  category: 'tools',
  run: async ({ text, pushName, sock, jid, msg, reply }) => {
    const name = text || pushName || 'RIOT';
    try {
      const seed = encodeURIComponent(name + Date.now());
      const url  = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=0a0a0f`;
      // send as document since WhatsApp can't render SVG inline
      await sock.sendMessage(
        jid,
        { image: { url: `https://api.dicebear.com/7.x/pixel-art/png?seed=${seed}&size=256` },
          caption: `🧑‍🎨 *Avatar for: ${name}*` },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ Avatar generation failed: ' + e.message);
    }
  },
};

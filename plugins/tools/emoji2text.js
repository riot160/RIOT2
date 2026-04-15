// plugins/tools/emoji2text.js
const EMOJI_MAP = {
  '😀':'Grinning Face','😂':'Face with Tears of Joy','🤣':'Rolling on the Floor Laughing',
  '❤️':'Red Heart','🔥':'Fire','👍':'Thumbs Up','🎉':'Party Popper','✅':'Check Mark',
  '❌':'Cross Mark','⭐':'Star','🌟':'Glowing Star','💯':'Hundred Points','🙏':'Folded Hands',
  '🤔':'Thinking Face','😭':'Loudly Crying Face','😍':'Smiling Face with Heart-Eyes',
  '🥺':'Pleading Face','😢':'Crying Face','😡':'Enraged Face','🤯':'Exploding Head',
  '🤝':'Handshake','👀':'Eyes','💪':'Flexed Biceps','🎯':'Bullseye','🚀':'Rocket',
  '💀':'Skull','👑':'Crown','🌍':'Globe showing Europe-Africa','🎵':'Musical Note',
  '📱':'Mobile Phone','💻':'Laptop','🎮':'Video Game','🏆':'Trophy','💰':'Money Bag',
  '🌈':'Rainbow','🌙':'Crescent Moon','☀️':'Sun','🌊':'Water Wave','🍕':'Pizza',
  '🍔':'Hamburger','🎂':'Birthday Cake','☕':'Hot Beverage','🍺':'Beer Mug',
};
export default {
  command: ['emoji2text', 'emojiname', 'whatemoji'],
  desc: 'Describe what emojis mean — .emoji2text 🔥💯🎉',
  category: 'tools',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .emoji2text <emojis>\nExample: .emoji2text 🔥💯🎉');
    const emojis = [...text].filter(c => c.codePointAt(0) > 127);
    if (!emojis.length) return reply('❌ No emojis found. Send emojis like 🔥💯🎉');
    const lines = [...new Set(emojis)].map(e => `${e} → ${EMOJI_MAP[e] || 'Unknown emoji'}`);
    await reply(`😀 *Emoji Meanings*\n\n${lines.join('\n')}`);
  },
};

// plugins/fun/personality.js
const TYPES = [
  { type: 'ENFJ', label: 'The Protagonist', traits: 'Charismatic leader, empathetic, inspiring' },
  { type: 'INTJ', label: 'The Architect',   traits: 'Strategic, independent, determined' },
  { type: 'ENTP', label: 'The Debater',     traits: 'Clever, curious, loves a challenge' },
  { type: 'INFP', label: 'The Mediator',    traits: 'Creative, idealistic, empathetic' },
  { type: 'ESTJ', label: 'The Executive',   traits: 'Organised, dedicated, strong-willed' },
  { type: 'ISFP', label: 'The Adventurer',  traits: 'Charming, artistic, curious' },
  { type: 'ENTJ', label: 'The Commander',   traits: 'Bold, imaginative, strong-willed' },
  { type: 'INFJ', label: 'The Advocate',    traits: 'Creative, insightful, principled' },
  { type: 'ESTP', label: 'The Entrepreneur',traits: 'Bold, direct, sociable' },
  { type: 'INTP', label: 'The Logician',    traits: 'Innovative, logical, curious' },
  { type: 'ENFP', label: 'The Campaigner',  traits: 'Enthusiastic, creative, free-spirited' },
  { type: 'ISTJ', label: 'The Logistician', traits: 'Reliable, practical, fact-minded' },
  { type: 'ESFJ', label: 'The Consul',      traits: 'Caring, social, traditional' },
  { type: 'ISTP', label: 'The Virtuoso',    traits: 'Bold, practical, experimental' },
  { type: 'ESFP', label: 'The Entertainer', traits: 'Spontaneous, energetic, enthusiastic' },
  { type: 'ISFJ', label: 'The Defender',    traits: 'Dedicated, warm, reliable' },
];
export default {
  command: ['personality', 'mbti', 'mytype'],
  desc: 'Get your fun personality type — .personality  or  .personality @user',
  category: 'fun',
  run: async ({ sock, jid, msg, pushName, senderNumber }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    const num       = target ? target.split('@')[0] : senderNumber;
    const name      = target ? `@${num}` : pushName;
    const seed      = [...num].reduce((a, c) => a + c.charCodeAt(0), 0);
    const p         = TYPES[seed % TYPES.length];
    await sock.sendMessage(jid, {
      text:
        `🧬 *Personality Analysis*\n\n` +
        `👤 Subject : ${name}\n\n` +
        `🏷️  Type    : *${p.type} — ${p.label}*\n` +
        `✨ Traits  : ${p.traits}\n\n` +
        `_For fun only! Real MBTI requires a proper test._`,
      mentions: target ? [target] : [],
    });
  },
};

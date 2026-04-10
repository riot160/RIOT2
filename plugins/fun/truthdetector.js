// plugins/fun/truthdetector.js
const VERDICTS = [
  { emoji: '✅', label: 'VERIFIED TRUE',   pct: () => Math.floor(Math.random() * 20 + 80) },
  { emoji: '❌', label: 'DEFINITELY LIE',  pct: () => Math.floor(Math.random() * 20 + 80) },
  { emoji: '🤔', label: 'UNCERTAIN',       pct: () => Math.floor(Math.random() * 30 + 40) },
  { emoji: '😂', label: 'ABSOLUTELY FALSE', pct: () => Math.floor(Math.random() * 15 + 85) },
  { emoji: '🧐', label: 'SUSPICIOUS',      pct: () => Math.floor(Math.random() * 20 + 50) },
];

export default {
  command: ['truthdetector', 'liedetect', 'isittrue'],
  desc: 'Run a fun lie detector on any statement — .truthdetector I am smart',
  category: 'fun',
  run: async ({ text, reply }) => {
    if (!text)
      return reply('Usage: .truthdetector <statement>\nExample: .truthdetector I love RIOT MD');
    const v   = VERDICTS[Math.floor(Math.random() * VERDICTS.length)];
    const pct = v.pct();
    const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
    await reply(
      `🔍 *RIOT MD Truth Detector*\n\n` +
      `📝 Statement: _"${text}"_\n\n` +
      `🔎 Analysing...\n` +
      `[${bar}]\n\n` +
      `${v.emoji} *${v.label}*\n` +
      `Confidence: ${pct}%\n\n` +
      `_Results are for entertainment only_ 😄`
    );
  },
};

// plugins/ai/analyze.js
import fetch from 'node-fetch';

export default {
  command: ['analyze', 'analyse'],
  desc: 'AI analysis of any text — reply to text with .analyze',
  category: 'ai',
  run: async ({ text, msg, reply }) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const content = text
      || quoted?.conversation
      || quoted?.extendedTextMessage?.text
      || '';
    if (!content)
      return reply('Usage: .analyze <text>\nOr reply to any message with .analyze');
    await reply('🔍 Analyzing…');
    try {
      const prompt =
        `Analyze the following text and give:\n` +
        `1. Main topic/theme\n2. Tone/sentiment\n3. Key points\n4. Your assessment\n\n` +
        `Text: "${content}"`;
      const res    = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(15000) }
      );
      const answer = await res.text();
      await reply(`🔍 *Analysis*\n\n${answer.trim()}`);
    } catch (e) {
      await reply('❌ Analysis failed: ' + e.message);
    }
  },
};

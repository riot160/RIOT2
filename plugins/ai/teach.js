// plugins/ai/teach.js
import fetch from 'node-fetch';

export default {
  command: ['teach', 'explain', 'howdoes'],
  desc: 'Get a simple explanation of any topic — .teach how does WiFi work',
  category: 'ai',
  run: async ({ text, reply }) => {
    if (!text)
      return reply('Usage: .teach <topic or question>\nExample: .teach how does the internet work\n.teach what is photosynthesis');
    await reply(`📚 Explaining: *${text}*…`);
    try {
      const prompt =
        `Explain "${text}" in simple, easy-to-understand language. ` +
        `Use a friendly tone, short sentences, and real-life examples. ` +
        `Keep it under 200 words.`;
      const res    = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(15000) }
      );
      const answer = await res.text();
      await reply(`📚 *${text}*\n\n${answer.trim()}`);
    } catch (e) {
      await reply('❌ Explanation failed: ' + e.message);
    }
  },
};

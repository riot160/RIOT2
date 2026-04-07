// plugins/ai/ask.js
import fetch from 'node-fetch';

export default {
  command: ['ai', 'ask', 'chatgpt', 'gpt'],
  desc: 'Ask the AI anything — .ai <question>',
  category: 'ai',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .ai <your question>');
    await reply('🤖 *Thinking…*');
    try {
      const res = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(text)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' } }
      );
      const answer = await res.text();
      await reply(`🤖 *RIOT AI*\n\n${answer.trim()}`);
    } catch (e) {
      await reply('❌ AI service unavailable: ' + e.message);
    }
  },
};

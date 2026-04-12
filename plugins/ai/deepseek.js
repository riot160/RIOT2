// plugins/ai/deepseek.js
import fetch from 'node-fetch';

export default {
  command: ['deepseek', 'ds', 'deep'],
  desc: 'Ask DeepSeek AI a question — .deepseek <question>',
  category: 'ai',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .deepseek <your question>');
    await reply('🧠 DeepSeek thinking…');
    try {
      const res    = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(text)}?model=deepseek-chat`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(20000) }
      );
      const answer = await res.text();
      await reply(`🧠 *DeepSeek AI*\n\n${answer.trim()}`);
    } catch (e) {
      await reply('❌ DeepSeek unavailable: ' + e.message);
    }
  },
};

// plugins/ai/story.js
import fetch from 'node-fetch';

export default {
  command: ['story', 'writestory'],
  desc: 'Generate a short story with AI — .story a hero saves a village',
  category: 'ai',
  run: async ({ text, reply }) => {
    if (!text)
      return reply('Usage: .story <your story idea>\nExample: .story a robot who learns to love');
    await reply('✍️ Writing your story…');
    try {
      const prompt = `Write a short, engaging story (about 150-200 words) about: ${text}. Make it creative and interesting with a clear beginning, middle, and end.`;
      const res    = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(20000) }
      );
      const story  = await res.text();
      await reply(`📖 *Story: ${text}*\n\n${story.trim()}`);
    } catch (e) {
      await reply('❌ Story generation failed: ' + e.message);
    }
  },
};

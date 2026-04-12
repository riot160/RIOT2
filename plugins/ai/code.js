// plugins/ai/code.js
import fetch from 'node-fetch';

export default {
  command: ['code', 'programming', 'generate'],
  desc: 'Generate code with AI — .code <description>',
  category: 'ai',
  run: async ({ text, reply }) => {
    if (!text) return reply('Usage: .code <describe what you want>\nExample: .code Python function to sort a list');
    await reply('💻 Generating code…');
    try {
      const prompt = `Write clean, working code for: ${text}\nOnly provide the code with brief comments. No lengthy explanations.`;
      const res    = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(15000) }
      );
      const answer = await res.text();
      await reply(`💻 *Code Generated*\n\n\`\`\`\n${answer.trim()}\n\`\`\``);
    } catch (e) {
      await reply('❌ Code generation failed: ' + e.message);
    }
  },
};

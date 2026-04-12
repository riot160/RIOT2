// plugins/ai/recipe.js
import fetch from 'node-fetch';

export default {
  command: ['recipe', 'cook', 'cooking'],
  desc: 'Get a recipe for any dish — .recipe jollof rice',
  category: 'ai',
  run: async ({ text, reply }) => {
    if (!text)
      return reply('Usage: .recipe <dish name>\nExample: .recipe jollof rice\n.recipe ugali with beef stew');
    await reply(`🍳 Getting recipe for: *${text}*…`);
    try {
      const prompt =
        `Give a simple recipe for "${text}" with:\n` +
        `- Ingredients list\n- Step by step instructions\n` +
        `- Cooking time\nKeep it practical and easy to follow.`;
      const res    = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(20000) }
      );
      const recipe = await res.text();
      await reply(`🍳 *Recipe: ${text}*\n\n${recipe.trim()}`);
    } catch (e) {
      await reply('❌ Recipe fetch failed: ' + e.message);
    }
  },
};

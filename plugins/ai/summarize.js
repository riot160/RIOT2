// plugins/ai/summarize.js
import fetch from 'node-fetch';

export default {
  command: ['summarize', 'summary', 'tldr'],
  desc: 'Summarize any long text with AI — .summarize <text>',
  category: 'ai',
  run: async ({ text, msg, reply }) => {
    // Check quoted message too
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const content = text
      || quoted?.conversation
      || quoted?.extendedTextMessage?.text
      || '';
    if (!content)
      return reply('Usage: .summarize <text>\nOr reply to any long message with .summarize');
    if (content.length < 50)
      return reply('❌ Text is too short to summarize.');
    await reply('📝 Summarizing…');
    try {
      const prompt = `Summarize this text in 3-5 clear bullet points:\n\n${content}`;
      const res    = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
        { headers: { 'User-Agent': 'RIOT-MD/1.0' }, signal: AbortSignal.timeout(15000) }
      );
      const answer = await res.text();
      await reply(`📝 *Summary*\n\n${answer.trim()}`);
    } catch (e) {
      await reply('❌ Summarization failed: ' + e.message);
    }
  },
};

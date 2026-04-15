// plugins/tools/uuid.js
import { randomUUID } from 'crypto';
export default {
  command: ['uuid', 'generateid'],
  desc: 'Generate unique UUIDs — .uuid  or  .uuid 5',
  category: 'tools',
  run: async ({ args, reply }) => {
    const count = Math.min(parseInt(args[0]) || 1, 10);
    const ids   = Array.from({ length: count }, () => randomUUID());
    await reply(`🔑 *Generated UUID${count > 1 ? 's' : ''}*\n\n\`\`\`\n${ids.join('\n')}\n\`\`\``);
  },
};

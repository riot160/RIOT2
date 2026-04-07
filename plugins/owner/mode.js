// plugins/owner/mode.js
import { config } from '../../config.js';

export default {
  command: 'mode',
  desc: 'Switch bot mode — .mode public  or  .mode private',
  category: 'owner',
  owner: true,
  run: async ({ args, reply }) => {
    const m = (args[0] || '').toLowerCase();
    if (!['public', 'private'].includes(m))
      return reply('Usage: .mode public\n       .mode private\n\n*Public* — anyone can use commands\n*Private* — only owner can use commands');
    config.MODE = m;
    await reply(`✅ Bot mode set to *${m.toUpperCase()}*`);
  },
};

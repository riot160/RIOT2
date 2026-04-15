// plugins/fun/slap.js
const SLAPS = [
  'slaps {user} with a large trout 🐟',
  'gives {user} a mighty slap that echoes across the universe 👋',
  'slaps {user} so hard their ancestors felt it 😤',
  'ninja-slaps {user} from behind 🥷',
  'slaps {user} with a frozen fish 🐠',
  'power-slaps {user} into next week ⚡',
  'gently (not really) slaps {user} 😄',
];
export default {
  command: ['slap', 'hit'],
  desc: 'Slap someone for fun — .slap @user',
  category: 'fun',
  run: async ({ sock, jid, msg, args, pushName, reply }) => {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target    = mentioned[0];
    if (!target) return reply('Mention someone to slap! .slap @user');
    const num    = target.split('@')[0];
    const action = SLAPS[Math.floor(Math.random() * SLAPS.length)].replace('{user}', `@${num}`);
    await sock.sendMessage(jid, {
      text: `👋 *${pushName} ${action}*`,
      mentions: [target],
    });
  },
};

// plugins/tools/hash.js
import { createHash } from 'crypto';
export default {
  command: ['hash', 'md5', 'sha256'],
  desc: 'Hash text with MD5/SHA256/SHA512 — .hash md5 hello',
  category: 'tools',
  run: async ({ args, reply }) => {
    const algo  = args[0]?.toLowerCase();
    const input = args.slice(1).join(' ');
    const algos = ['md5','sha1','sha256','sha512'];
    if (!algo || !input)
      return reply(`Usage: .hash <algorithm> <text>\nAlgorithms: ${algos.join(', ')}\nExample: .hash sha256 hello world`);
    if (!algos.includes(algo)) return reply(`❌ Unknown algorithm. Use: ${algos.join(', ')}`);
    const hashed = createHash(algo).update(input).digest('hex');
    await reply(`🔐 *Hash (${algo.toUpperCase()})*\n\nInput  : ${input}\nResult : \`\`\`${hashed}\`\`\``);
  },
};

// plugins/fun/dog.js
import fetch from 'node-fetch';
export default {
  command: ['dog', 'woof', 'puppy'],
  desc: 'Get a random cute dog image — .dog  or  .dog husky',
  category: 'fun',
  run: async ({ args, sock, jid, msg, reply }) => {
    const breed = args[0]?.toLowerCase();
    try {
      const url = breed
        ? `https://dog.ceo/api/breed/${breed}/images/random`
        : 'https://dog.ceo/api/breeds/image/random';
      const res  = await fetch(url);
      const d    = await res.json();
      if (d.status !== 'success') throw new Error('Breed not found');
      const imgRes = await fetch(d.message);
      const buf    = Buffer.from(await imgRes.arrayBuffer());
      await sock.sendMessage(jid,
        { image: buf, caption: breed ? `🐕 *${breed.charAt(0).toUpperCase() + breed.slice(1)}*` : '🐕 *Woof!*' },
        { quoted: msg }
      );
    } catch {
      await reply(`❌ No images found for breed: *${breed || 'random'}*\nTry: .dog husky · .dog poodle · .dog labrador`);
    }
  },
};

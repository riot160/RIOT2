// plugins/tools/quran.js
import fetch from 'node-fetch';

export default {
  command: ['quran', 'ayah'],
  desc: 'Get a Quran verse — .quran 2:255  or  .quran random',
  category: 'tools',

  run: async ({ text, reply }) => {
    const query = text?.trim() || 'random';
    try {
      let ref;
      if (query === 'random') {
        const surah = Math.floor(Math.random() * 114) + 1;
        const ayah  = Math.floor(Math.random() * 7) + 1;
        ref = `${surah}:${ayah}`;
      } else {
        ref = query;
      }

      const [surah, ayah] = ref.split(':').map(Number);
      if (!surah || !ayah) return reply('Usage: .quran <surah>:<ayah>\nExample: .quran 2:255\n.quran 1:1');

      // English translation
      const res  = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`);
      const d    = await res.json();

      // Arabic original
      const res2 = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`);
      const d2   = await res2.json();

      if (d.status !== 'OK') return reply(`❌ Verse not found: *${ref}*\nExample: .quran 2:255`);

      const engText = d.data?.text   || '—';
      const araText = d2.data?.text  || '';
      const surahName = d.data?.surah?.englishName || '';
      const surahNum  = d.data?.surah?.number || surah;
      const ayahNum   = d.data?.numberInSurah || ayah;

      await reply(
        `📿 *Quran ${surahNum}:${ayahNum}*\n` +
        `_Surah ${surahName}_\n\n` +
        `*Arabic:*\n${araText}\n\n` +
        `*English (Asad):*\n_"${engText}"_\n\n` +
        `— 🌙 The Holy Quran`
      );
    } catch (e) {
      await reply('❌ Quran verse lookup failed: ' + e.message);
    }
  },
};

// plugins/tools/zodiac.js
export default {
  command: ['zodiac', 'starsign', 'horoscope'],
  desc: 'Get zodiac sign from birthday — .zodiac 15 April',
  category: 'tools',
  run: async ({ args, reply }) => {
    const day   = parseInt(args[0]);
    const month = args[1]?.toLowerCase();
    const months= ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const m     = months.indexOf(month) + 1;
    if (!day || !m) return reply('Usage: .zodiac <day> <month>\nExample: .zodiac 15 April');
    const signs = [
      { name:'Capricorn ♑', emoji:'🐐', dates:'Dec 22 – Jan 19',   traits:'Ambitious, disciplined, patient' },
      { name:'Aquarius ♒',  emoji:'🌊', dates:'Jan 20 – Feb 18',   traits:'Independent, innovative, humanitarian' },
      { name:'Pisces ♓',    emoji:'🐟', dates:'Feb 19 – Mar 20',   traits:'Compassionate, artistic, intuitive' },
      { name:'Aries ♈',     emoji:'🐏', dates:'Mar 21 – Apr 19',   traits:'Courageous, confident, enthusiastic' },
      { name:'Taurus ♉',    emoji:'🐂', dates:'Apr 20 – May 20',   traits:'Reliable, patient, practical' },
      { name:'Gemini ♊',    emoji:'👯', dates:'May 21 – Jun 20',   traits:'Adaptable, curious, affectionate' },
      { name:'Cancer ♋',    emoji:'🦀', dates:'Jun 21 – Jul 22',   traits:'Intuitive, emotional, protective' },
      { name:'Leo ♌',       emoji:'🦁', dates:'Jul 23 – Aug 22',   traits:'Creative, passionate, generous' },
      { name:'Virgo ♍',     emoji:'🌾', dates:'Aug 23 – Sep 22',   traits:'Analytical, hardworking, practical' },
      { name:'Libra ♎',     emoji:'⚖️', dates:'Sep 23 – Oct 22',   traits:'Diplomatic, fair, social' },
      { name:'Scorpio ♏',   emoji:'🦂', dates:'Oct 23 – Nov 21',   traits:'Brave, passionate, resourceful' },
      { name:'Sagittarius ♐',emoji:'🏹',dates:'Nov 22 – Dec 21',   traits:'Generous, idealistic, curious' },
    ];
    const cutoffs = [19,18,20,19,20,20,22,22,22,22,21,21];
    const idx = day <= cutoffs[m-1] ? (m-2+12)%12 : (m-1)%12;
    const s   = signs[idx];
    await reply(`✨ *Zodiac Sign*\n\n${s.emoji} *${s.name}*\n📅 ${s.dates}\n💫 Traits: ${s.traits}`);
  },
};

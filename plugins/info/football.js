// plugins/info/football.js
import fetch from 'node-fetch';
export default {
  command: ['football', 'soccer', 'scores'],
  desc: 'Get live/recent football scores — .football EPL',
  category: 'info',
  run: async ({ args, reply }) => {
    const league = (args[0] || 'EPL').toUpperCase();
    const IDS    = { EPL:39, LA_LIGA:140, SERIE_A:135, BUNDESLIGA:78, UCL:2, LIGUE1:61 };
    const id     = IDS[league] || IDS.EPL;
    const label  = Object.keys(IDS).find(k => IDS[k] === id) || 'EPL';
    try {
      const res = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${id}&season=2024&last=5`,
        { headers: {
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
          'x-rapidapi-key': 'DEMO', // free tier
        }}
      );
      const d   = await res.json();
      const fixtures = d.response;
      if (!fixtures?.length) {
        return reply(
          `⚽ *${label} Recent Results*\n\n` +
          `_No recent match data available._\n\n` +
          `Available leagues:\n${Object.keys(IDS).join(', ')}`
        );
      }
      let text = `⚽ *${label} — Recent Results*\n${'─'.repeat(28)}\n\n`;
      fixtures.slice(0, 5).forEach(f => {
        const h = f.teams.home, a = f.teams.away, g = f.goals;
        const status = f.fixture.status.short;
        text += `${h.name} *${g.home ?? '?'}–${g.away ?? '?'}* ${a.name}\n`;
        text += `   📅 ${f.fixture.date?.slice(0,10)} · ${status}\n\n`;
      });
      await reply(text.trim());
    } catch {
      await reply(
        `⚽ *${label} Scores*\n\n` +
        `_Live scores require an API key._\n\n` +
        `Visit https://www.livescore.com for live scores.`
      );
    }
  },
};

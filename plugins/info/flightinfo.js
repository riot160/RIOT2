// plugins/info/flightinfo.js
import fetch from 'node-fetch';
export default {
  command: ['flight', 'flightinfo', 'flightstatus'],
  desc: 'Look up live flight status — .flight KQ100',
  category: 'info',
  run: async ({ args, reply }) => {
    const code = (args[0] || '').toUpperCase().trim();
    if (!code) return reply('Usage: .flight <flight code>\nExample: .flight KQ100\n.flight EK001\n.flight BA077');
    try {
      // AviationStack free tier
      const res  = await fetch(
        `http://api.aviationstack.com/v1/flights?access_key=DEMO&flight_iata=${code}&limit=1`,
        { signal: AbortSignal.timeout(8000) }
      );
      const d    = await res.json();
      const f    = d.data?.[0];
      if (!f) return reply(`✈️ *${code}*\n\n_Live tracking requires an API key._\n\nTry: https://flightaware.com/live/flight/${code}`);
      const dep  = f.departure, arr = f.arrival;
      await reply(
        `✈️ *Flight ${code}*\n` +
        `${'─'.repeat(28)}\n` +
        `🛫 From     : ${dep.airport} (${dep.iata})\n` +
        `🛬 To       : ${arr.airport} (${arr.iata})\n` +
        `⏰ Depart   : ${dep.scheduled?.slice(11,16)} UTC\n` +
        `⏰ Arrive   : ${arr.scheduled?.slice(11,16)} UTC\n` +
        `📊 Status   : ${f.flight_status || '—'}\n` +
        `✈️  Aircraft : ${f.aircraft?.iata || '—'}\n` +
        `🏢 Airline  : ${f.airline?.name || '—'}`
      );
    } catch { await reply(`✈️ Check flight *${code}* at:\nhttps://flightaware.com/live/flight/${code}`); }
  },
};

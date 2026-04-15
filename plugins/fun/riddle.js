// plugins/fun/riddle.js
import fetch from 'node-fetch';
const RIDDLES = [
  { q:'I speak without a mouth and hear without ears. I have no body but I come alive with the wind. What am I?', a:'An echo' },
  { q:'The more you take, the more you leave behind. What am I?', a:'Footsteps' },
  { q:'I have cities, but no houses live there. I have mountains, but no trees. I have water, but no fish. I have roads, but no cars. What am I?', a:'A map' },
  { q:'What has hands but cannot clap?', a:'A clock' },
  { q:'The more you have of it, the less you see. What is it?', a:'Darkness' },
  { q:'I am always in front of you but cannot be seen. What am I?', a:'The future' },
  { q:'What gets wetter the more it dries?', a:'A towel' },
  { q:'I have keys but no locks. I have space but no room. You can enter but cannot go inside. What am I?', a:'A keyboard' },
  { q:'What can travel around the world while staying in a corner?', a:'A stamp' },
  { q:'What has one eye but cannot see?', a:'A needle' },
];

const active = new Map();

export default {
  command: ['riddle', 'puzzle'],
  desc: 'Get a riddle — reply .answer to reveal',
  category: 'fun',
  run: async ({ sock, jid, command, text, reply }) => {
    if (command === 'answer' || text?.toLowerCase() === 'answer') {
      const r = active.get(jid);
      if (!r) return reply('No active riddle! Use .riddle to start one.');
      active.delete(jid);
      return reply(`💡 *Answer:* ${r}`);
    }
    const r = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    active.set(jid, r.a);
    await reply(`🤔 *Riddle*\n\n${r.q}\n\n_Type .answer to reveal the answer!_`);
  },
};

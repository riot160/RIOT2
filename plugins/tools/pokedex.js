// plugins/tools/pokedex.js
import fetch from 'node-fetch';
export default {
  command: ['pokedex', 'pokemon', 'poke'],
  desc: 'Get Pokémon info — .pokedex pikachu  or  .pokedex 25',
  category: 'tools',
  run: async ({ args, sock, jid, msg, reply }) => {
    const query = (args[0] || '').toLowerCase();
    if (!query) return reply('Usage: .pokedex <name or number>\nExample: .pokedex pikachu\n.pokedex 150');
    await reply(`🔍 Looking up: *${query}*…`);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (!res.ok) return reply(`❌ Pokémon *${query}* not found.`);
      const d     = await res.json();
      const types = d.types.map(t => t.type.name).join(', ');
      const moves = d.moves.slice(0, 4).map(m => m.move.name).join(', ');
      const stats = d.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(' · ');
      const caption =
        `🎮 *#${d.id} ${d.name.charAt(0).toUpperCase() + d.name.slice(1)}*\n` +
        `${'─'.repeat(28)}\n` +
        `⚡ Types    : ${types}\n` +
        `📏 Height   : ${d.height / 10}m\n` +
        `⚖️  Weight   : ${d.weight / 10}kg\n` +
        `${'─'.repeat(28)}\n` +
        `📊 Base Stats:\n${stats}\n` +
        `${'─'.repeat(28)}\n` +
        `🥊 Moves    : ${moves}`;
      const imgUrl = d.sprites?.other?.['official-artwork']?.front_default || d.sprites?.front_default;
      if (imgUrl) {
        const imgRes = await fetch(imgUrl);
        const buf    = Buffer.from(await imgRes.arrayBuffer());
        await sock.sendMessage(jid, { image: buf, caption }, { quoted: msg });
      } else {
        await reply(caption);
      }
    } catch (e) {
      await reply('❌ Pokédex lookup failed: ' + e.message);
    }
  },
};

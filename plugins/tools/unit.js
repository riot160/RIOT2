// plugins/tools/unit.js
const UNITS = {
  // length (base: metre)
  km:1000, m:1, cm:0.01, mm:0.001, mile:1609.34, yard:0.9144, foot:0.3048, inch:0.0254,
  // weight (base: gram)
  kg:1000, g:1, mg:0.001, lb:453.592, oz:28.3495, tonne:1e6,
  // volume (base: litre)
  l:1, ml:0.001, cl:0.01, dl:0.1, gallon:3.78541, pint:0.473176, cup:0.236588, tbsp:0.0147868, tsp:0.00492892,
};
export default {
  command: ['unit', 'convert'],
  desc: 'Convert units — .unit 5 km miles',
  category: 'tools',
  run: async ({ args, reply }) => {
    const [val, from, to] = args;
    if (!val || !from || !to)
      return reply('Usage: .unit <value> <from> <to>\nExample: .unit 5 km miles\nUnits: km m cm mm mile yard foot inch kg g mg lb oz l ml gallon pint cup');
    const v  = parseFloat(val);
    const f  = from.toLowerCase();
    const t  = to.toLowerCase();
    if (isNaN(v))   return reply('❌ Invalid number');
    if (!UNITS[f])  return reply(`❌ Unknown unit: ${from}`);
    if (!UNITS[t])  return reply(`❌ Unknown unit: ${to}`);
    const result = (v * UNITS[f] / UNITS[t]).toFixed(6).replace(/\.?0+$/, '');
    await reply(`📐 *Unit Converter*\n\n${v} ${from} = *${result} ${to}*`);
  },
};

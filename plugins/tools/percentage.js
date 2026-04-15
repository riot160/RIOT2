// plugins/tools/percentage.js
export default {
  command: ['percentage', 'percent', 'pct'],
  desc: 'Calculate percentages — .percentage 20 of 150',
  category: 'tools',
  run: async ({ args, reply }) => {
    const pct = parseFloat(args[0]);
    const of  = parseFloat(args[2]);
    if (isNaN(pct) || isNaN(of))
      return reply(
        'Usage: .percentage <pct> of <value>\nExample: .percentage 20 of 150\n\nOther:\n.percentage 30 150 → what % is 30 of 150?\n.percentage increase 100 120 → % increase'
      );
    const result = (pct / 100) * of;
    await reply(
      `📊 *Percentage Calculator*\n\n` +
      `${pct}% of ${of} = *${result.toFixed(2)}*\n\n` +
      `🔄 Reverse: ${result.toFixed(2)} is ${pct}% of ${of}`
    );
  },
};

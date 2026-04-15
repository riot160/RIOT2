// plugins/tools/bmi.js
export default {
  command: ['bmi', 'bodymass'],
  desc: 'Calculate Body Mass Index — .bmi <weight kg> <height cm>',
  category: 'tools',
  run: async ({ args, reply }) => {
    const weight = parseFloat(args[0]);
    const height = parseFloat(args[1]);
    if (!weight || !height)
      return reply('Usage: .bmi <weight in kg> <height in cm>\nExample: .bmi 70 175');
    const h   = height / 100;
    const bmi = (weight / (h * h)).toFixed(1);
    const cat = bmi < 18.5 ? '🔵 Underweight'
              : bmi < 25   ? '🟢 Normal weight'
              : bmi < 30   ? '🟡 Overweight'
              :               '🔴 Obese';
    await reply(
      `⚖️ *BMI Calculator*\n\n` +
      `⚖️  Weight : ${weight} kg\n` +
      `📏 Height : ${height} cm\n` +
      `📊 BMI    : *${bmi}*\n` +
      `${cat}\n\n` +
      `_Underweight <18.5 · Normal 18.5–24.9 · Overweight 25–29.9 · Obese ≥30_`
    );
  },
};

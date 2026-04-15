// plugins/tools/temp.js
export default {
  command: ['temp', 'temperature', 'celsius', 'fahrenheit'],
  desc: 'Convert temperature — .temp 100 c  or  .temp 212 f',
  category: 'tools',
  run: async ({ args, reply }) => {
    const val  = parseFloat(args[0]);
    const unit = args[1]?.toLowerCase();
    if (isNaN(val) || !unit)
      return reply('Usage: .temp <value> <c/f/k>\nExamples:\n.temp 100 c → to Fahrenheit & Kelvin\n.temp 212 f → to Celsius & Kelvin');
    let result = '';
    if (unit === 'c') {
      const f = (val * 9/5) + 32;
      const k = val + 273.15;
      result  = `🌡️ *${val}°C* =\n🔴 ${f.toFixed(2)}°F\n🔵 ${k.toFixed(2)}K`;
    } else if (unit === 'f') {
      const c = (val - 32) * 5/9;
      const k = c + 273.15;
      result  = `🌡️ *${val}°F* =\n🟢 ${c.toFixed(2)}°C\n🔵 ${k.toFixed(2)}K`;
    } else if (unit === 'k') {
      const c = val - 273.15;
      const f = c * 9/5 + 32;
      result  = `🌡️ *${val}K* =\n🟢 ${c.toFixed(2)}°C\n🔴 ${f.toFixed(2)}°F`;
    } else {
      return reply('Unit must be c (Celsius), f (Fahrenheit), or k (Kelvin)');
    }
    await reply(result);
  },
};

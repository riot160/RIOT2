// plugins/tools/age.js
export default {
  command: ['age', 'birthday', 'howold'],
  desc: 'Calculate age from birth date — .age 2000-04-12',
  category: 'tools',
  run: async ({ args, reply }) => {
    const input = args[0];
    if (!input) return reply('Usage: .age <YYYY-MM-DD>\nExample: .age 2000-04-12');
    const birth = new Date(input);
    if (isNaN(birth)) return reply('❌ Invalid date. Use format YYYY-MM-DD');
    const now   = new Date();
    if (birth > now) return reply('❌ Birth date cannot be in the future.');
    let years  = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth()    - birth.getMonth();
    let days   = now.getDate()     - birth.getDate();
    if (days   < 0) { months--; days += 30; }
    if (months < 0) { years--;  months += 12; }
    const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
    const daysLeft = Math.ceil((nextBday - now) / (1000 * 60 * 60 * 24));
    await reply(
      `🎂 *Age Calculator*\n\n` +
      `📅 Born   : ${birth.toDateString()}\n` +
      `🎉 Age    : *${years} years, ${months} months, ${days} days*\n` +
      `🕯️  Next BD : ${daysLeft === 0 ? '🎉 Today!' : `in ${daysLeft} days`}`
    );
  },
};

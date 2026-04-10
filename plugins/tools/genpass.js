// plugins/tools/genpass.js
const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  special: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

export default {
  command: ['genpass', 'password', 'generatepassword'],
  desc: 'Generate a strong random password — .genpass 16',
  category: 'tools',
  run: async ({ args, reply }) => {
    const len = Math.min(64, Math.max(8, parseInt(args[0]) || 16));
    const pool = CHARS.upper + CHARS.lower + CHARS.numbers + CHARS.special;
    // Ensure at least one of each type
    let pass =
      CHARS.upper[Math.floor(Math.random() * CHARS.upper.length)] +
      CHARS.lower[Math.floor(Math.random() * CHARS.lower.length)] +
      CHARS.numbers[Math.floor(Math.random() * CHARS.numbers.length)] +
      CHARS.special[Math.floor(Math.random() * CHARS.special.length)];
    for (let i = pass.length; i < len; i++) {
      pass += pool[Math.floor(Math.random() * pool.length)];
    }
    // Shuffle
    pass = [...pass].sort(() => Math.random() - 0.5).join('');
    await reply(
      `🔐 *Generated Password*\n\n` +
      `\`\`\`${pass}\`\`\`\n\n` +
      `📏 Length  : ${len} characters\n` +
      `💪 Strength: Very Strong\n\n` +
      `_Save this somewhere safe!_`
    );
  },
};

// plugins/tools/password2.js
export default {
  command: ['password2', 'checkpassword', 'pwstrength'],
  desc: 'Check how strong a password is — .password2 MyPass123!',
  category: 'tools',
  run: async ({ args, reply }) => {
    const pw = args[0];
    if (!pw) return reply('Usage: .password2 <password>\nExample: .password2 MyPass123!');
    let score = 0;
    const checks = [
      { test: pw.length >= 8,                label: 'At least 8 characters',      pass: pw.length >= 8 },
      { test: pw.length >= 12,               label: 'At least 12 characters',     pass: pw.length >= 12 },
      { test: /[A-Z]/.test(pw),              label: 'Contains uppercase',          pass: /[A-Z]/.test(pw) },
      { test: /[a-z]/.test(pw),              label: 'Contains lowercase',          pass: /[a-z]/.test(pw) },
      { test: /[0-9]/.test(pw),              label: 'Contains numbers',            pass: /[0-9]/.test(pw) },
      { test: /[!@#$%^&*\-_=+]/.test(pw),  label: 'Contains special characters', pass: /[!@#$%^&*\-_=+]/.test(pw) },
      { test: pw.length >= 16,              label: 'At least 16 characters',     pass: pw.length >= 16 },
    ];
    score = checks.filter(c => c.pass).length;
    const pct     = Math.round((score / checks.length) * 100);
    const bar     = '█'.repeat(Math.round(pct/10)) + '░'.repeat(10 - Math.round(pct/10));
    const label   = pct < 40 ? '🔴 Weak' : pct < 70 ? '🟡 Moderate' : pct < 90 ? '🟢 Strong' : '💎 Very Strong';
    let text      = `🔐 *Password Strength*\n\n[${bar}] ${pct}%\n${label}\n\n*Checks:*\n`;
    checks.forEach(c => { text += `${c.pass ? '✅' : '❌'} ${c.label}\n`; });
    await reply(text.trim());
  },
};

// plugins/tools/whois.js
import fetch from 'node-fetch';
export default {
  command: ['whois', 'domaininfo'],
  desc: 'WHOIS lookup for a domain — .whois google.com',
  category: 'tools',
  run: async ({ args, reply }) => {
    const domain = (args[0] || '').toLowerCase().trim();
    if (!domain) return reply('Usage: .whois <domain>\nExample: .whois google.com');
    try {
      const res = await fetch(`https://api.domainsdb.info/v1/domains/search?domain=${domain}&zone=com&limit=1`);
      const d   = await res.json();
      const dom = d.domains?.[0];
      // Fallback to rdap
      const res2 = await fetch(`https://rdap.org/domain/${domain}`, { signal: AbortSignal.timeout(5000) });
      const d2   = await res2.json();
      const created  = d2.events?.find(e => e.eventAction === 'registration')?.eventDate?.slice(0,10);
      const expiry   = d2.events?.find(e => e.eventAction === 'expiration')?.eventDate?.slice(0,10);
      const updated  = d2.events?.find(e => e.eventAction === 'last changed')?.eventDate?.slice(0,10);
      const nameservers = d2.nameservers?.map(n => n.ldhName).slice(0,3).join(', ');
      const registrar   = d2.entities?.find(e => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find(v => v[0]==='fn')?.[3];
      await reply(
        `🔍 *WHOIS: ${domain}*\n` +
        `${'─'.repeat(28)}\n` +
        `📅 Registered : ${created || '—'}\n` +
        `📅 Expires    : ${expiry  || '—'}\n` +
        `📅 Updated    : ${updated || '—'}\n` +
        `🏢 Registrar  : ${registrar || '—'}\n` +
        `🌐 Nameservers: ${nameservers || '—'}\n` +
        `📊 Status     : ${d2.status?.join(', ') || '—'}`
      );
    } catch { await reply(`🔍 WHOIS for *${domain}*\n\nCheck: https://who.is/whois/${domain}`); }
  },
};

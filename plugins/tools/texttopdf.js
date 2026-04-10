// plugins/tools/texttopdf.js
import fetch from 'node-fetch';

export default {
  command: ['texttopdf', 'topdf'],
  desc: 'Convert text into a PDF document — .texttopdf <text>',
  category: 'tools',
  run: async ({ text, sock, jid, msg, reply }) => {
    if (!text)
      return reply('Usage: .texttopdf <text>\nExample: .texttopdf My name is Sydney. I love RIOT MD.');
    await reply('📄 Generating PDF…');
    try {
      // Use pdfgen API (free, no auth)
      const res = await fetch('https://pdfgen.de/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          html: `<html><body style="font-family:Arial;font-size:16px;padding:40px;line-height:1.6">
                  <h2 style="color:#1a1a2e">RIOT MD — Generated Document</h2>
                  <hr/>
                  <p>${text.replace(/\n/g, '<br>')}</p>
                  </body></html>`,
        }),
      });
      if (!res.ok) throw new Error('PDF service error');
      const buf = Buffer.from(await res.arrayBuffer());
      await sock.sendMessage(jid,
        { document: buf, mimetype: 'application/pdf', fileName: 'RIOT_MD_document.pdf', caption: '📄 Here is your PDF' },
        { quoted: msg }
      );
    } catch (e) {
      await reply('❌ PDF generation failed: ' + e.message);
    }
  },
};

// plugins/owner/pair.js
import { config } from '../../config.js';

export default {
  command: 'pair',
  desc: 'Show instructions to pair a new WhatsApp account',
  category: 'owner',
  run: async ({ reply }) => {
    await reply(
      `📱 *How to Pair a New Device*\n\n` +
      `*Step 1:* Open the RIOT MD web dashboard\n` +
      `🌐 \`http://your-domain:${config.PORT || 3000}\`\n\n` +
      `*Step 2:* Go to *Pair Device*\n\n` +
      `*Step 3:* Enter:\n` +
      `• User ID: any unique name (e.g. user1)\n` +
      `• Phone: your number with country code\n\n` +
      `*Step 4:* Copy the pairing code\n\n` +
      `*Step 5:* On WhatsApp:\n` +
      `Settings → Linked Devices\n` +
      `→ Link a Device\n` +
      `→ Link with Phone Number\n` +
      `→ Enter the code\n\n` +
      `✅ Done! Bot will connect automatically.`
    );
  },
};

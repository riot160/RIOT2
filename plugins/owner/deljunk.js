// plugins/owner/deljunk.js
export default {
  command: ['deljunk', 'clearbot'],
  desc: 'Delete recent bot messages from this chat — .deljunk <count>',
  category: 'owner',
  owner: true,
  run: async ({ reply }) => {
    // WhatsApp Web API does not expose a bulk-delete endpoint.
    // Individual deletion works only when the message key is known.
    await reply(
      '⚠️ *Bulk delete is not directly supported by the WhatsApp API.*\n\n' +
      'To delete individual bot messages:\n' +
      '• Reply to any bot message with *.delete*\n\n' +
      '_WhatsApp restricts third-party bulk deletion to protect users._'
    );
  },
};

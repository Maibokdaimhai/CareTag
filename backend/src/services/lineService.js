const line = require('@line/bot-sdk');

const client = new line.Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

exports.sendPushMessage = async (userId, message) => {
  try {
    return await client.pushMessage(userId, { type: 'text', text: message });
  } catch (err) {
    console.error('Line Service Error:', err.message);
  }
};
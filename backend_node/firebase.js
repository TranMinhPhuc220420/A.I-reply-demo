var admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging')

var serviceAccount = require('./sateraito-shopfood-firebase-adminsdk-375ss-6e099cb7a0.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sateraito-shopfood-default-rtdb.firebaseio.com'
});

module.exports = {
  sendNotification: function ({ tokens, title, body, imageUrl }) {
    const message = {
      notification: {
        title: title,
        body: body,
        imageUrl: imageUrl,
      },
      tokens: tokens
    };

    // Send a message to devices subscribed to the provided topic.
    getMessaging().sendMulticast(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  }
} 
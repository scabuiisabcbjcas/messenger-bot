const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = EAAF270d4BZC4BOyDUEgvhmFSo2dxcF6cnyuKHpt5FfS5XIjCZAmbdkQc75ZB9bSG6wH81rycQp06UkmZA1g9NorLieyzKirbQ7J8Jy2WuZBczJw9l9czo3TYyxbKQ5n10PZBnGVgkRoNtV5c6762gsotSHUetvrVZBdzPlI73Exdouj2BiYZCDH16SsFDB4tK6XSV0pRHH9rFrFTuUrR;
const VERIFY_TOKEN = Aa50180987zZ; // Replace with your verification token

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      let sender_psid = webhook_event.sender.id;
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, received_message) {
  if (received_message.text) {
    let response = {
      "text": `You sent the message: "${received_message.text}". Now let's extract the ad link!`
    };

    callSendAPI(sender_psid, response);
  }
}

function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  };

  request({
    "uri": "https://graph.facebook.com/v10.0/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

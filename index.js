const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'mytoken123';
const PAGE_TOKEN = 'PASTE_YOUR_PAGE_TOKEN_HERE';

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        const senderId = event.sender.id;
        if (event.message && event.message.attachments) {
          for (const att of event.message.attachments) {
            if (att.type === 'audio') {
              const url = att.payload.url;
              await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_TOKEN}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  recipient: {id: senderId},
                  message: {text: 'Link audio: ' + url}
                })
              });
            }
          }
        }
      }
    }
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot running on port', PORT));

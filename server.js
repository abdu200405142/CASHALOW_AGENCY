const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');

// إعدادات التليجرام
const TELEGRAM_BOT_TOKEN = '8194506415:AAEcJ6bzmJFd02dcYt0fB7O5oOumSR2cL78';
const TELEGRAM_CHAT_ID = '5968641533';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// إنشاء تطبيق Express
const app = express();
app.use(bodyParser.json());

// تخزين العملاء المتصلين
const clients = new Set();

// استقبال الرسائل من الموقع وإرسالها إلى التليجرام
app.post('/api/send', (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).send('Missing fields');

  const text = [${userId}]: ${message};

  axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    reply_markup: {
      force_reply: true
    }
  }).then(() => {
    res.send('Message sent to Telegram');
  }).catch((err) => {
    console.error('Error sending to Telegram:', err.message);
    res.status(500).send('Telegram error');
  });
});

// استقبال ردود الأدمن من التليجرام وإرسالها للمستخدم
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const msg = req.body.message;
    if (msg && msg.reply_to_message && msg.reply_to_message.text) {
      const match = msg.reply_to_message.text.match(/^\[(.+?)\]:/);
      const userId = match ? match[1] : null;
      const replyText = msg.text;
      if (userId && replyText) {
        const payload = JSON.stringify({ userId, text: replyText });
        clients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) ws.send(payload);
        });
      }
    }
    res.send('ok');
  } catch (e) {
    console.error('Webhook error:', e.message);
    res.send('ok');
  }
});

// فحص الصحة
app.get('/', (req, res) => res.send('Server running'));

// بدء السيرفر (Express + WebSocket)
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

server.listen(PORT, () => {
  console.log('Server running on port', PORT);
});


// نسخة واحدة نظيفة من كود الدردشة الثنائية مع تيليجرام
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const TELEGRAM_TOKEN = '8194506415:AAEcJ6bzmJFd02dcYt0fB7O5oOumSR2cL78';
const TELEGRAM_CHAT_ID = '5968641533';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {}; // userId: ws

// استقبال رسالة من الموقع وإرسالها إلى تيليجرام
app.post('/api/send', (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ ok: false });

  // أرسل الرسالة إلى تيليجرام مع userId
  const text = `رسالة جديدة من الموقع:\n\nمعرف الزائر: ${userId}\n${message}`;
  fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      reply_markup: {
        force_reply: true
      }
    })
  });
  res.json({ ok: true });
});

// استقبال Webhook من تيليجرام (ردك أنت)
app.post('/webhook', (req, res) => {
  const msg = req.body.message;
  if (msg && msg.reply_to_message && msg.reply_to_message.text) {
    // استخراج userId من الرسالة الأصلية
    const match = msg.reply_to_message.text.match(/معرف الزائر: (.+?)\n/);
    if (match) {
      const userId = match[1];
      // أرسل الرد عبر WebSocket للعميل المناسب
      if (clients[userId]) {
        clients[userId].send(JSON.stringify({
          from: 'admin',
          text: msg.text
        }));
      }
    }
  }
  res.sendStatus(200);
});

// WebSocket: ربط المستخدمين
wss.on('connection', function connection(ws, req) {
  ws.on('message', function incoming(data) {
    try {
      const { userId } = JSON.parse(data);
      if (userId) clients[userId] = ws;
    } catch {}
  });
  ws.on('close', function() {
    for (const id in clients) {
      if (clients[id] === ws) delete clients[id];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on', PORT));
// server.js
// Node.js Express server with WebSocket for two-way chat between website and Telegram

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');

const TELEGRAM_BOT_TOKEN = '8194506415:AAEcJ6bzmJFd02dcYt0fB7O5oOumSR2cL78';
const TELEGRAM_CHAT_ID = '5968641533';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

app.use(bodyParser.json());

// Store connected clients
const clients = new Set();

// HTTP server and WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// 1. Endpoint to receive messages from website and forward to Telegram
app.post('/api/send', async (req, res) => {
  const { message, userId } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  try {
    // Send to Telegram (include userId for context)
    const text = userId ? `[${userId}]: ${message}` : message;
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Telegram webhook to receive replies from admin
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const msg = req.body.message;
    if (msg && msg.reply_to_message && msg.reply_to_message.text) {
      // Extract userId from original message if present
      const match = msg.reply_to_message.text.match(/^\[(.+?)\]:/);
      const userId = match ? match[1] : null;
      const replyText = msg.text;
      if (userId && replyText) {
        // Send reply to all connected clients with matching userId
        const payload = JSON.stringify({ userId, text: replyText });
        clients.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) ws.send(payload);
        });
      }
    }
    res.send('ok');
  } catch (e) {
    res.send('ok');
  }
});

// 3. Health check
app.get('/', (req, res) => res.send('Server running'));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});

// --- Telegram Webhook setup (run once, not in production) ---
// axios.get(`${TELEGRAM_API}/setWebhook?url=https://YOUR_SERVER_URL/api/telegram-webhook`)
//   .then(r => console.log(r.data));

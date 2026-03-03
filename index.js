require('dotenv').config();
const express = require('express');
const axios = require('axios');
const SYSTEM_PROMPT = require('./systemPrompt');

const app = express();
app.use(express.json());

const conversaciones = {};

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  console.log('🔍 Verificación webhook:', { mode, token });
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Body recibido:', JSON.stringify(req.body));
    const entry = req.body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];
    console.log('📋 Message:', JSON.stringify(message));

    if (!message || message.type !== 'text') {
      console.log('⚠️ No es texto, ignorando...');
      return res.sendStatus(200);
    }

    const numeroUsuario = message.from;
    const mensajeUsuario = message.text.body.trim();
    console.log(`📩 De ${numeroUsuario}: ${mensajeUsuario}`);

    if (!conversaciones[numeroUsuario]) conversaciones[numeroUsuario] = [];
    conversaciones[numeroUsuario].push({ role: 'user', content: mensajeUsuario });
    if (conversaciones[numeroUsuario].length > 10) {
      conversaciones[numeroUsuario] = conversaciones[numeroUsuario].slice(-10);
    }

    console.log('🤖 Llamando a Groq...');
    const groqResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversaciones[numeroUsuario]
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const respuesta = groqResponse.data.choices[0].message.content;
    conversaciones[numeroUsuario].push({ role: 'assistant', content: respuesta });
    console.log(`🤖 Groq respondió: ${respuesta}`);

    console.log('📤 Enviando a WhatsApp...');
    const waRes = await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: numeroUsuario,
        type: 'text',
        text: { body: respuesta }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Enviado:', JSON.stringify(waRes.data));
    res.sendStatus(200);

  } catch (error) {
    console.error('❌ Error:', JSON.stringify(error.response?.data) || error.message);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => res.send('✅ Bot PREVEBSA & ATIPOP funcionando'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot corriendo en puerto ${PORT}`));
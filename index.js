require('dotenv').config();
const express = require('express');
const axios = require('axios');
const SYSTEM_PROMPT = require('./systemPrompt');

const app = express();
app.use(express.json());

const conversaciones = {};
const estadoUsuario = {};

// ── Videos de tutoriales ──────────────────────────────────────
const VIDEOS = {
  'prevebsa_login': {
    url: 'https://drive.google.com/uc?export=download&id=1xiZ9qBOp7W8zb9sEfs-3U9v-1aLHUsYQ',
    titulo: '📹 Tutorial: Login en PREVEBSA'
  },
  'prevebsa_inspecciones': {
    url: 'https://drive.google.com/uc?export=download&id=1d23W40kT64R4zJ01qgYTDlAOfudVA9JB',
    titulo: '📹 Tutorial: Inspecciones en PREVEBSA'
  },
  'prevebsa_plan_diario': {
    url: 'https://drive.google.com/uc?export=download&id=1r3XjnUIWM8T8lEXptBJKMUmZ09SF8SJ4',
    titulo: '📹 Tutorial: Plan Diario en PREVEBSA'
  },
  'atipop_faceid': {
    url: 'https://drive.google.com/uc?export=download&id=1wEwGs7Mc8h9gSO22kRy6itN27YiQIq5O',
    titulo: '📹 Tutorial: Login con FaceID en ATIPOP'
  },
  'atipop_credenciales': {
    url: 'https://drive.google.com/uc?export=download&id=115kK2LCCS43mfD2S9wWJ266zmzdl_LvZ',
    titulo: '📹 Tutorial: Login con credenciales en ATIPOP'
  },
  'borrar_cache': {
    url: 'https://drive.google.com/uc?export=download&id=1K-F66G0Mu4vHzF9-vrt42QnUoGUrEDLR',
    titulo: '📹 Tutorial: Cómo borrar caché'
  },
  'recuperar_contrasena': {
    url: 'https://drive.google.com/uc?export=download&id=1-tVGXmw_NqvBqTgX7Wkc0nMURgLXSOrh',
    titulo: '📹 Tutorial: Recuperar contraseña en ATIPOP'
  }
};

const MENU_TUTORIALES = `📹 *Tutoriales disponibles:*

1️⃣ 🔐 Login en PREVEBSA
2️⃣ 📋 Plan Diario en PREVEBSA
3️⃣ 🔍 Inspecciones en PREVEBSA
4️⃣ 😃 Login con FaceID en ATIPOP
5️⃣ 🔑 Login con credenciales en ATIPOP
6️⃣ 🗑️ Cómo borrar caché
7️⃣ 🔒 Recuperar contraseña ATIPOP
0️⃣ 🔙 Volver al menú principal

_Responde con el número del tutorial_ 👇`;

const MENU_PRINCIPAL = `👋 ¡Hola! Bienvenido al soporte técnico de *ATI* 🛠️

Soy tu asistente virtual y estoy aquí para ayudarte.
¿Con cuál aplicativo necesitas ayuda?

1️⃣ *PREVEBSA* — App de seguridad y salud en el trabajo
2️⃣ *ATIPOP* — App de operación de subestaciones eléctricas
3️⃣ 📹 *TUTORIALES* — Ver videos de uso
0️⃣ 🙋 *AGENTE* — Hablar con un asesor humano

_Responde con el número de tu opción_ 👇`;

// ── Función enviar mensaje de texto ──────────────────────────
async function enviarMensaje(numeroUsuario, texto) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to: numeroUsuario,
      type: 'text',
      text: { body: texto }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// ── Función enviar video ──────────────────────────────────────
async function enviarVideo(numeroUsuario, videoKey) {
  const video = VIDEOS[videoKey];
  if (!video) return;

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: numeroUsuario,
        type: 'video',
        video: {
          link: video.url,
          caption: video.titulo
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Video enviado: ${video.titulo}`);
  } catch (error) {
    console.error('❌ Error enviando video:', error.response?.data);
    // Si falla el video, enviar enlace directo
    await enviarMensaje(
      numeroUsuario,
      `${video.titulo}\n\n🔗 Ver video: https://drive.google.com/file/d/${video.url.split('id=')[1]}/view`
    );
  }
}

// ── Verificación del webhook ──────────────────────────────────
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ── Recibir mensajes ──────────────────────────────────────────
app.post('/webhook', async (req, res) => {
  try {
    console.log('📨 Body recibido:', JSON.stringify(req.body));
    const entry = req.body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== 'text') return res.sendStatus(200);

    const numeroUsuario = message.from;
    const mensajeUsuario = message.text.body.trim();
    console.log(`📩 De ${numeroUsuario}: ${mensajeUsuario}`);

    // Inicializar estado del usuario
    if (!estadoUsuario[numeroUsuario]) {
      estadoUsuario[numeroUsuario] = { menu: 'principal', primerMensaje: true };
    }

    const estado = estadoUsuario[numeroUsuario];

    // ── Menú principal al primer mensaje ─────────────────────
    if (estado.primerMensaje) {
      estado.primerMensaje = false;
      await enviarMensaje(numeroUsuario, MENU_PRINCIPAL);
      return res.sendStatus(200);
    }

    // ── Detectar "menu" o "inicio" para reiniciar ─────────────
    if (['menu', 'inicio', 'hola', 'start'].includes(mensajeUsuario.toLowerCase())) {
      estado.menu = 'principal';
      await enviarMensaje(numeroUsuario, MENU_PRINCIPAL);
      return res.sendStatus(200);
    }

    // ── Menú de tutoriales ────────────────────────────────────
    if (estado.menu === 'tutoriales') {
      const tutorialMap = {
        '1': 'prevebsa_login',
        '2': 'prevebsa_plan_diario',
        '3': 'prevebsa_inspecciones',
        '4': 'atipop_faceid',
        '5': 'atipop_credenciales',
        '6': 'borrar_cache',
        '7': 'recuperar_contrasena',
        '0': 'volver'
      };

      if (mensajeUsuario === '0') {
        estado.menu = 'principal';
        await enviarMensaje(numeroUsuario, MENU_PRINCIPAL);
        return res.sendStatus(200);
      }

      if (tutorialMap[mensajeUsuario]) {
        await enviarMensaje(numeroUsuario, '⏳ Enviando tutorial, un momento...');
        await enviarVideo(numeroUsuario, tutorialMap[mensajeUsuario]);
        await enviarMensaje(numeroUsuario, '¿Necesitas ayuda con algo más?\n\nEscribe *menu* para volver al inicio 🏠');
        return res.sendStatus(200);
      }
    }

    // ── Menú principal opciones ───────────────────────────────
    if (estado.menu === 'principal') {
      if (mensajeUsuario === '3') {
        estado.menu = 'tutoriales';
        await enviarMensaje(numeroUsuario, MENU_TUTORIALES);
        return res.sendStatus(200);
      }
      if (mensajeUsuario === '0') {
        await enviarMensaje(
          numeroUsuario,
          '🙏 *Disculpa los inconvenientes causados.*\n\nEntendemos tu situación y queremos ayudarte.\n\nUn asesor del equipo de soporte técnico de ATI te responderá en breve desde este mismo número. ⏳\n\n_Mientras esperas puedes describir tu problema aquí_ 📝\n\n¡Gracias por tu paciencia! 🤝'
        );
        return res.sendStatus(200);
      }
    }

    // ── Detectar agente en cualquier momento ──────────────────
    const palabrasAgente = ['agente', 'humano', 'persona', 'asesor', 'ayuda urgente'];
    if (palabrasAgente.some(p => mensajeUsuario.toLowerCase().includes(p))) {
      await enviarMensaje(
        numeroUsuario,
        '🙏 *Disculpa los inconvenientes causados.*\n\nEntendemos tu situación y queremos ayudarte.\n\nUn asesor del equipo de soporte técnico de ATI te responderá en breve desde este mismo número. ⏳\n\n_Mientras esperas puedes describir tu problema aquí_ 📝\n\n¡Gracias por tu paciencia! 🤝'
      );
      return res.sendStatus(200);
    }

    // ── Respuesta con IA (Groq) ───────────────────────────────
    if (!conversaciones[numeroUsuario]) conversaciones[numeroUsuario] = [];
    conversaciones[numeroUsuario].push({ role: 'user', content: mensajeUsuario });
    if (conversaciones[numeroUsuario].length > 10) {
      conversaciones[numeroUsuario] = conversaciones[numeroUsuario].slice(-10);
    }

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
    console.log(`🤖 Groq: ${respuesta}`);

    await enviarMensaje(numeroUsuario, respuesta);
    res.sendStatus(200);

  } catch (error) {
    console.error('❌ Error:', JSON.stringify(error.response?.data) || error.message);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => res.send('✅ Bot PREVEBSA & ATIPOP funcionando'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot corriendo en puerto ${PORT}`));
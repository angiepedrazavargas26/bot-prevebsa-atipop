require('dotenv').config();
const express = require('express');
const axios = require('axios');
const SYSTEM_PROMPT = require('./systemPrompt');

const app = express();
app.use(express.json());

const conversaciones = {};
const estadoUsuario = {};
const modoHumano = new Set();

// ── Números de agentes ────────────────────────────────────────
const AGENTES = ['573102614279', '573212135099'];

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

const MENSAJE_AGENTE = `🙏 *Disculpa los inconvenientes causados.*

Entendemos tu situación y queremos ayudarte de la mejor manera.

Un asesor del equipo de soporte técnico de ATI te responderá en breve desde este mismo número. ⏳

_Mientras esperas puedes describir tu problema aquí_ 📝

¡Gracias por tu paciencia! 🤝`;

// ── Función enviar mensaje ────────────────────────────────────
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

// ── Función notificar agentes ─────────────────────────────────
async function notificarAgentes(numeroUsuario, ultimoMensaje) {
  const alerta = `🔔 *NUEVO CASO DE SOPORTE*

👤 Usuario: +${numeroUsuario}
💬 Mensaje: "${ultimoMensaje}"

Para atender escribe:
▶️ *#agente ${numeroUsuario}*

Para responderle:
💬 *#msg ${numeroUsuario} tu mensaje aquí*

Para devolver al bot:
⏹️ *#bot ${numeroUsuario}*`;

  for (const agente of AGENTES) {
    try {
      await enviarMensaje(agente, alerta);
    } catch (error) {
      console.error(`❌ Error notificando agente ${agente}:`, error.message);
    }
  }
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
        video: { link: video.url, caption: video.titulo }
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
    const entry = req.body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];
    if (!message || message.type !== 'text') return res.sendStatus(200);

    const numeroUsuario = message.from;
    const mensajeUsuario = message.text.body.trim();
    console.log(`📩 De ${numeroUsuario}: ${mensajeUsuario}`);

    // ── Comandos de agentes ───────────────────────────────────
    if (AGENTES.includes(numeroUsuario)) {

      // Activar modo agente: #agente 573163195872
      if (mensajeUsuario.startsWith('#agente ')) {
        const numCliente = mensajeUsuario.split('#agente ')[1].trim();
        modoHumano.add(numCliente);
        await enviarMensaje(numeroUsuario, `✅ *Modo agente activado* para +${numCliente}\n\nPara responderle escribe:\n💬 *#msg ${numCliente} tu mensaje aquí*\n\nCuando termines escribe:\n⏹️ *#bot ${numCliente}*`);
        await enviarMensaje(numCliente, '👨‍💻 Un asesor de ATI ya está disponible para ayudarte. ¿En qué puedo ayudarte?');
        return res.sendStatus(200);
      }

      // Responder al usuario: #msg 573163195872 Hola, te ayudo con eso
      if (mensajeUsuario.startsWith('#msg ')) {
        const partes = mensajeUsuario.split(' ');
        const numCliente = partes[1].trim();
        const mensajeParaCliente = partes.slice(2).join(' ');
        if (!mensajeParaCliente) {
          await enviarMensaje(numeroUsuario, '⚠️ Escribe el mensaje después del número. Ej: *#msg 573163195872 Hola, te ayudo*');
          return res.sendStatus(200);
        }
        await enviarMensaje(numCliente, `👨‍💻 *Asesor ATI:*\n${mensajeParaCliente}`);
        await enviarMensaje(numeroUsuario, `✅ Mensaje enviado a +${numCliente}`);
        return res.sendStatus(200);
      }

      // Desactivar modo agente: #bot 573163195872
      if (mensajeUsuario.startsWith('#bot ')) {
        const numCliente = mensajeUsuario.split('#bot ')[1].trim();
        modoHumano.delete(numCliente);
        await enviarMensaje(numeroUsuario, `✅ Bot reactivado para +${numCliente}`);
        await enviarMensaje(numCliente, '🤖 El asistente virtual vuelve a estar disponible.\n\nEscribe *menu* si necesitas más ayuda. 😊');
        return res.sendStatus(200);
      }
    }

    // ── Si está en modo humano, reenviar al agente activo ─────
    if (modoHumano.has(numeroUsuario)) {
      console.log(`👨‍💻 Modo humano activo para ${numeroUsuario}, reenviando a agentes...`);
      const alerta = `📨 *Mensaje nuevo de +${numeroUsuario}:*\n"${mensajeUsuario}"\n\nResponde con:\n💬 *#msg ${numeroUsuario} tu respuesta*`;
      for (const agente of AGENTES) {
        try {
          await enviarMensaje(agente, alerta);
        } catch (e) {
          console.error(`Error notificando agente ${agente}:`, e.message);
        }
      }
      return res.sendStatus(200);
    }

    // ── Inicializar estado ────────────────────────────────────
    if (!estadoUsuario[numeroUsuario]) {
      estadoUsuario[numeroUsuario] = { menu: 'principal', primerMensaje: true };
    }
    const estado = estadoUsuario[numeroUsuario];

    // ── Primer mensaje ────────────────────────────────────────
    if (estado.primerMensaje) {
      estado.primerMensaje = false;
      await enviarMensaje(numeroUsuario, MENU_PRINCIPAL);
      return res.sendStatus(200);
    }

    // ── Reiniciar con "menu" o "inicio" ───────────────────────
    if (['menu', 'inicio', 'hola', 'start'].includes(mensajeUsuario.toLowerCase())) {
      estado.menu = 'principal';
      await enviarMensaje(numeroUsuario, MENU_PRINCIPAL);
      return res.sendStatus(200);
    }

    // ── Detectar solicitud de agente ──────────────────────────
    const palabrasAgente = ['agente', 'humano', 'persona', 'asesor', 'ayuda urgente', 'llevo horas'];
    if (palabrasAgente.some(p => mensajeUsuario.toLowerCase().includes(p)) || mensajeUsuario === '0') {
      await enviarMensaje(numeroUsuario, MENSAJE_AGENTE);
      await notificarAgentes(numeroUsuario, mensajeUsuario);
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
        '7': 'recuperar_contrasena'
      };
      if (mensajeUsuario === '0') {
        estado.menu = 'principal';
        await enviarMensaje(numeroUsuario, MENU_PRINCIPAL);
        return res.sendStatus(200);
      }
      if (tutorialMap[mensajeUsuario]) {
        await enviarMensaje(numeroUsuario, '⏳ Enviando tutorial, un momento...');
        await enviarVideo(numeroUsuario, tutorialMap[mensajeUsuario]);
        await enviarMensaje(numeroUsuario, '¿Necesitas ayuda con algo más?\nEscribe *menu* para volver al inicio 🏠');
        return res.sendStatus(200);
      }
    }

    // ── Menú principal opción 3 tutoriales ───────────────────
    if (mensajeUsuario === '3') {
      estado.menu = 'tutoriales';
      await enviarMensaje(numeroUsuario, MENU_TUTORIALES);
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
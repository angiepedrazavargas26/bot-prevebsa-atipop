require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// ============================================================
// AGENTES
// ============================================================
const AGENTES = ['573102614279', '573212135099'];
const modoHumano = new Set();
const agenteActivo = new Map();
const sessions = {};

// ============================================================
// KNOWLEDGE BASE
// ============================================================
const knowledgeBase = [
  {
    id: "A1", app: "ATIPOP", modulo: "Acceso",
    keywords: ["faceid", "face id", "cara", "biometrico", "no reconoce", "no me deja entrar", "foto", "atiface"],
    respuesta: "El problema con FaceID tiene solución 😊\n\n1️⃣ Ve a *Mi Cuenta → ATIFace* y verifica que tu foto esté registrada\n2️⃣ Si no está, toma una nueva foto con buena iluminación y fondo neutro\n3️⃣ Si ya estaba pero sigue fallando, elimina el registro y vuelve a hacerlo\n\n¿Eso te funcionó?"
  },
  {
    id: "A2", app: "ATIPOP", modulo: "Formularios",
    keywords: ["sin dato", "formulario bloqueado", "formulario lleno", "datos corruptos", "no puedo editar", "aparece respondido"],
    respuesta: "Eso es caché corrupta, se soluciona así:\n\n1️⃣ Ve a *Ajustes del celular → Aplicaciones → ATIPOP → Almacenamiento*\n2️⃣ Toca *Borrar Datos* y *Borrar Caché*\n3️⃣ Vuelve a iniciar sesión y abre el formulario\n\n⚠️ No cierres la app mientras el formulario está cargando.\n\n¿Quedó bien?"
  },
  {
    id: "A3", app: "ATIPOP", modulo: "Sincronización",
    keywords: ["no carga", "desactualizado", "informacion vieja", "no sincroniza", "sincronizacion", "datos viejos", "no aparece"],
    respuesta: "Tranquilo, eso es de sincronización 😊\n\n1️⃣ Presiona *Sincronizar* en el menú lateral ☰\n2️⃣ Asegúrate de tener conexión a internet estable\n3️⃣ Si no carga, cierra sesión, vuelve a entrar y sincroniza de nuevo\n\n💡 Sincroniza al inicio de cada jornada.\n\n¿Ya cargó?"
  },
  {
    id: "A4", app: "ATIPOP", modulo: "Recibos",
    keywords: ["recibos", "recibo", "nomina", "pago", "no carga recibos", "tarda", "lento"],
    respuesta: "El módulo de Recibos puede ser lento — es un problema conocido. Prueba:\n\n1️⃣ Espera al menos *30 segundos* antes de intentar de nuevo\n2️⃣ Funciona mejor con WiFi\n3️⃣ Cierra y vuelve a abrir la app\n\n¿Pudo cargar?"
  },
  {
    id: "A5", app: "ATIPOP", modulo: "Avisos",
    keywords: ["ver todos", "avisos", "boton no funciona", "se cierra", "notificaciones avisos"],
    respuesta: "Ese es un error conocido en el botón *Ver todos*. Mientras se corrige:\n\n1️⃣ Entra al módulo de *Avisos* directamente desde el menú principal\n2️⃣ Evita presionar *Ver todos* repetidamente\n\nYa está reportado al equipo técnico. ¿Pudiste ver tus avisos?"
  },
  {
    id: "A6", app: "ATIPOP", modulo: "Certificaciones",
    keywords: ["certificacion", "certificado", "no se envia", "correo", "email", "no llega", "enviar certificacion"],
    respuesta: "El envío automático tiene una falla conocida. Por ahora:\n\n1️⃣ Descarga la certificación manualmente desde el módulo\n2️⃣ Envíala por correo adjuntando el archivo\n\nYa está reportado al equipo. ¿Pudiste descargarla?"
  },
  {
    id: "A7", app: "ATIPOP", modulo: "GPS",
    keywords: ["gps", "alerta", "riesgo", "emergencia", "no llega alerta", "ubicacion", "no vibra", "no notifica"],
    respuesta: "Las alertas GPS pueden fallar si no están configuradas:\n\n1️⃣ Ve a *Configuración* y ajusta la *distancia de alertas GPS*\n2️⃣ Activa las *alertas por vibración*\n3️⃣ Verifica que ATIPOP tenga permisos de ubicación en Ajustes del celular\n\n¿Quedaron activadas?"
  },
  {
    id: "A8", app: "ATIPOP", modulo: "Acceso",
    keywords: ["olvide contrasena", "no recuerdo clave", "contrasena incorrecta", "no puedo entrar", "acceso", "login atipop", "usuario atipop", "clave atipop", "sga"],
    respuesta: "Para recuperar tu contraseña de ATIPOP:\n\n1️⃣ En la pantalla de inicio toca *Recuperar contraseña*\n2️⃣ Ingresa tu correo registrado\n\n⚠️ La contraseña está vinculada al sistema *SGA*. Si el correo no funciona, contacta a *Talento Humano*.\n\n¿Pudiste ingresar?"
  },
  {
    id: "P1", app: "PREVEBSA", modulo: "Plan Diario",
    keywords: ["plan anterior", "plan de ayer", "plan viejo", "plan diario", "dia anterior", "cache plan"],
    respuesta: "La app quedó con datos del día anterior. Solución:\n\n1️⃣ Ve a *Ajustes del celular → Aplicaciones → PREVEBSA → Almacenamiento → Borrar caché*\n2️⃣ Reinicia la app y vuelve a ingresar\n\n💡 Cierra sesión al finalizar la jornada para evitar esto.\n\n¿Ya aparece el plan de hoy?"
  },
  {
    id: "P2", app: "PREVEBSA", modulo: "Login",
    keywords: ["login prevebsa", "no puedo entrar prevebsa", "contrasena prevebsa", "usuario prevebsa", "olvide clave prevebsa"],
    respuesta: "Tranquilo, el login de PREVEBSA tiene solución 😊\n\n1️⃣ Verifica que el correo esté bien escrito, sin espacios\n2️⃣ La contraseña distingue mayúsculas — escríbela despacio\n3️⃣ Si la olvidaste, toca *Recuperar Contraseña* e ingresa tu email 📧\n4️⃣ Si aparece usuario inactivo, el administrador de tu empresa lo reactiva\n\n¿Cuál de estos puede ser tu caso?"
  },
  {
    id: "P3", app: "PREVEBSA", modulo: "Planificaciones",
    keywords: ["planificacion", "planificaciones", "no puedo crear plan", "autorizar", "autorizacion", "rechazada", "finalizada"],
    respuesta: "Para crear una planificación en PREVEBSA:\n\n1️⃣ Elige el formato: ⚡*Con Energía* o 🔌*Sin Energía*\n2️⃣ Completa: persona que autoriza, zona, municipio, ubicación Maps 📍\n3️⃣ Agrega actividades, riesgos ⚠️ y barreras 🛡️\n4️⃣ Asigna trabajadores con sus firmas ✍️\n5️⃣ Toca *Enviar a Autorización* — el coordinador aprueba ✅\n\nEstados: 🟡 Creada → 🟠 Espera → 🟢 Autorizada → ✅ Finalizada\n\n¿En qué paso tienes el problema?"
  },
  {
    id: "P4", app: "PREVEBSA", modulo: "Inspecciones",
    keywords: ["inspeccion", "inspecciones", "preoperacional", "vehiculo", "moto", "equipo critico", "no aparece inspeccion"],
    respuesta: "Para inspecciones preoperacionales:\n\nTipos: 🚗 Vehículo | 🏍️ Moto | 🔧 Equipos críticos\n\n1️⃣ Selecciona el tipo\n2️⃣ Completa área, placa y firma\n3️⃣ Responde el formulario\n4️⃣ Agrega fotos 📸\n5️⃣ Toca *Completar*\n\n⚠️ Si no aparece para asignar al plan, verifica que esté en estado *Completada*.\n\n¿La inspección no aparece o el problema es en otro paso?"
  }
];

// ============================================================
// HELPERS
// ============================================================

function getSession(phone) {
  if (!sessions[phone]) sessions[phone] = { history: [], attempts: 0, primerMensaje: true, nombre: null };
  return sessions[phone];
}

function searchKnowledge(text) {
  const lower = text.toLowerCase();
  for (const entry of knowledgeBase) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) return entry;
    }
  }
  return null;
}

async function sendWhatsApp(to, message) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } })
    }
  );
  return response.json();
}

async function notificarAgentes(phone, texto) {
  const alerta = `🔔 *NUEVO CASO DE SOPORTE*

👤 Usuario: +${phone}
💬 Mensaje: "${texto}"

Para atender escribe:
▶️ *#agente ${phone}*

_(Luego escribe normalmente — tus mensajes llegan directo al usuario)_

Para terminar:
⏹️ *#bot*`;

  for (const agente of AGENTES) {
    try { await sendWhatsApp(agente, alerta); }
    catch (e) { console.error(`Error notificando agente ${agente}:`, e.message); }
  }
}

async function askClaude(userMessage, history, nombre) {
  const systemPrompt = `Eres el asistente de soporte técnico de ATI para los aplicativos ATIPOP y PREVEBSA.
Hablas como un compañero colombiano cercano y amigable — no como un robot.
Usas frases naturales como "Tranquilo", "Claro que sí", "Uy, eso sí es molesto 😅", "A ver cuéntame".
${nombre ? `El nombre del usuario es ${nombre}, úsalo de vez en cuando de forma natural.` : ''}

REGLAS:
- Responde siempre en español colombiano natural
- Da soluciones paso a paso pero con tono cercano
- Haz UNA pregunta al final para verificar
- Usa emojis moderadamente
- Si no sabes algo, dilo con honestidad
- Varía cómo empiezas cada respuesta — no siempre igual

CONTEXTO:
- ATIPOP: app para gestión de subestaciones eléctricas
- PREVEBSA: app para seguridad y salud en el trabajo (HSE)`;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.content[0].text;
}

// ============================================================
// MENÚS
// ============================================================

const MENU_PRINCIPAL = `👋 ¡Hola! Bienvenido al soporte técnico de *ATI* 🛠️

Soy tu asistente virtual y estoy aquí para ayudarte.
¿Con cuál aplicativo necesitas ayuda?

1️⃣ *PREVEBSA* — App de seguridad y salud en el trabajo
2️⃣ *ATIPOP* — App de operación de subestaciones eléctricas
3️⃣ 📹 *TUTORIALES* — Ver videos de uso
0️⃣ 🙋 *AGENTE* — Hablar con un asesor humano

_Responde con el número de tu opción_ 👇`;

const MENSAJE_AGENTE = `🙏 *Disculpa los inconvenientes.*

Entiendo que esto es frustrante y quiero que lo resolvamos pronto.

Un asesor de ATI te va a escribir en breve desde este mismo número. ⏳

Si quieres, cuéntame más detalles del error o toma una captura 📸 — eso le ayudará mucho al asesor.

¡Gracias por tu paciencia! 🤝`;

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

const VIDEOS = {
  '1': { url: 'https://drive.google.com/uc?export=download&id=1xiZ9qBOp7W8zb9sEfs-3U9v-1aLHUsYQ', titulo: '📹 Login en PREVEBSA' },
  '2': { url: 'https://drive.google.com/uc?export=download&id=1r3XjnUIWM8T8lEXptBJKMUmZ09SF8SJ4', titulo: '📹 Plan Diario en PREVEBSA' },
  '3': { url: 'https://drive.google.com/uc?export=download&id=1d23W40kT64R4zJ01qgYTDlAOfudVA9JB', titulo: '📹 Inspecciones en PREVEBSA' },
  '4': { url: 'https://drive.google.com/uc?export=download&id=1wEwGs7Mc8h9gSO22kRy6itN27YiQIq5O', titulo: '📹 FaceID en ATIPOP' },
  '5': { url: 'https://drive.google.com/uc?export=download&id=115kK2LCCS43mfD2S9wWJ266zmzdl_LvZ', titulo: '📹 Login con credenciales en ATIPOP' },
  '6': { url: 'https://drive.google.com/uc?export=download&id=1K-F66G0Mu4vHzF9-vrt42QnUoGUrEDLR', titulo: '📹 Cómo borrar caché' },
  '7': { url: 'https://drive.google.com/uc?export=download&id=1-tVGXmw_NqvBqTgX7Wkc0nMURgLXSOrh', titulo: '📹 Recuperar contraseña ATIPOP' }
};

async function enviarVideo(to, key) {
  const video = VIDEOS[key];
  if (!video) return;
  try {
    await fetch(`https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'video', video: { link: video.url, caption: video.titulo } })
    });
  } catch {
    await sendWhatsApp(to, `${video.titulo}\n\n🔗 Ver: https://drive.google.com/file/d/${video.url.split('id=')[1]}/view`);
  }
}

// ============================================================
// WEBHOOK
// ============================================================

app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) res.status(200).send(challenge);
  else res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const entry = req.body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];
    if (!message || message.type !== 'text') return;

    const phone = message.from;
    const text = message.text.body.trim();
    console.log(`📩 De ${phone}: ${text}`);

    // ── Comandos de agentes ───────────────────────────────────
    if (AGENTES.includes(phone)) {
      if (text.startsWith('#agente ')) {
        const cliente = text.split('#agente ')[1].trim();
        modoHumano.add(cliente);
        agenteActivo.set(phone, cliente);
        await sendWhatsApp(phone, `✅ *Modo agente activado* para +${cliente}\n\nEscribe normalmente — tus mensajes llegan directo al usuario.\n\nCuando termines escribe: *#bot*`);
        await sendWhatsApp(cliente, '👨‍💻 Un asesor de ATI ya está disponible. ¿En qué puedo ayudarte?');
        return;
      }
      if (text === '#bot') {
        const cliente = agenteActivo.get(phone);
        if (cliente) {
          modoHumano.delete(cliente);
          agenteActivo.delete(phone);
          const s = getSession(cliente);
          s.attempts = 0;
          await sendWhatsApp(phone, `✅ Caso cerrado. Bot reactivado para +${cliente}`);
          await sendWhatsApp(cliente, '🤖 El asistente virtual vuelve a estar disponible.\n\nEscribe *menu* si necesitas más ayuda. 😊');
        } else {
          await sendWhatsApp(phone, '⚠️ No tienes ningún caso activo.');
        }
        return;
      }
      if (agenteActivo.has(phone)) {
        const cliente = agenteActivo.get(phone);
        await sendWhatsApp(cliente, `👨‍💻 *Asesor ATI:*\n${text}`);
        return;
      }
    }

    // ── Si cliente está en modo humano ────────────────────────
    if (modoHumano.has(phone)) {
      let agenteAsignado = null;
      for (const [agente, cliente] of agenteActivo.entries()) {
        if (cliente === phone) { agenteAsignado = agente; break; }
      }
      if (agenteAsignado) {
        await sendWhatsApp(agenteAsignado, `📨 *Usuario +${phone}:*\n"${text}"`);
      } else {
        for (const agente of AGENTES) {
          try { await sendWhatsApp(agente, `📨 *Mensaje de +${phone}:*\n"${text}"\n\nEscribe *#agente ${phone}* para atenderlo`); }
          catch (e) { console.error(e.message); }
        }
      }
      return;
    }

    const session = getSession(phone);

    // ── Primer mensaje ────────────────────────────────────────
    if (session.primerMensaje) {
      session.primerMensaje = false;
      await sendWhatsApp(phone, MENU_PRINCIPAL);
      return;
    }

    // ── Detectar nombre ───────────────────────────────────────
    const matchNombre = text.match(/(?:me llamo|soy|mi nombre es)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)/i);
    if (matchNombre) session.nombre = matchNombre[1];

    // ── Reiniciar ─────────────────────────────────────────────
    if (['menu', 'inicio', 'hola', 'start'].includes(text.toLowerCase())) {
      session.attempts = 0;
      session.history = [];
      await sendWhatsApp(phone, MENU_PRINCIPAL);
      return;
    }

    // ── Solicitud de agente ───────────────────────────────────
    const palabrasAgente = ['agente', 'humano', 'persona', 'asesor', 'ayuda urgente'];
    if (palabrasAgente.some(p => text.toLowerCase().includes(p)) || text === '0') {
      await sendWhatsApp(phone, MENSAJE_AGENTE);
      await notificarAgentes(phone, text);
      modoHumano.add(phone);
      return;
    }

    // ── Tutoriales ────────────────────────────────────────────
    if (session.menu === 'tutoriales') {
      if (text === '0') { session.menu = null; await sendWhatsApp(phone, MENU_PRINCIPAL); return; }
      if (VIDEOS[text]) {
        await sendWhatsApp(phone, '⏳ Enviando tutorial...');
        await enviarVideo(phone, text);
        await sendWhatsApp(phone, '¿Necesitas ayuda con algo más? Escribe *menu* para volver 🏠');
        return;
      }
    }
    if (text === '3') { session.menu = 'tutoriales'; await sendWhatsApp(phone, MENU_TUTORIALES); return; }

    // ── Knowledge base ────────────────────────────────────────
    const match = searchKnowledge(text);
    if (match) {
      session.attempts = 0;
      session.history.push({ role: 'user', content: text });
      session.history.push({ role: 'assistant', content: match.respuesta });
      await sendWhatsApp(phone, match.respuesta);
      return;
    }

    // ── Escalada por intentos ─────────────────────────────────
    const frasesFallo = ['no funcionó', 'no funciono', 'sigue igual', 'no sirve', 'no pude', 'todavía no', 'aun no', 'aún no', 'sigue el problema'];
    if (frasesFallo.some(f => text.toLowerCase().includes(f))) session.attempts++;

    if (session.attempts >= 2) {
      await sendWhatsApp(phone, MENSAJE_AGENTE);
      await notificarAgentes(phone, `Problema sin resolver después de varios intentos. Último mensaje: "${text}"`);
      modoHumano.add(phone);
      session.attempts = 0;
      return;
    }

    // ── Claude ────────────────────────────────────────────────
    const reply = await askClaude(text, session.history, session.nombre);
    session.history.push({ role: 'user', content: text });
    session.history.push({ role: 'assistant', content: reply });
    if (session.history.length > 10) session.history = session.history.slice(-10);

    await sendWhatsApp(phone, reply);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});

app.get('/', (req, res) => res.json({ status: '✅ ATI Bot funcionando', timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ATI Bot corriendo en puerto ${PORT}`));
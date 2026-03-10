const express = require("express");
const app = express();
app.use(express.json());

// ============================================================
// KNOWLEDGE BASE — Base de conocimiento ATI
// ============================================================
const knowledgeBase = [
{
id: "A1", app: "ATIPOP", modulo: "Acceso",
keywords: ["faceid", "face id", "cara", "biometrico", "no reconoce", "no me deja entrar", "foto", "atiface"],
respuesta: "El problema con FaceID tiene solución fácil 😊\n\n1️⃣ Ve a *Mi Cuenta → ATIFace* y verifica que tu foto esté registrada.\n2️⃣ Si no está, toma una nueva foto siguiendo el proceso de ATIFace.\n3️⃣ Si ya estaba pero sigue fallando, elimina el registro y vuelve a hacerlo.\n\n💡 Regístrate con buena iluminación y fondo neutro.\n\n¿Esto resolvió tu problema?"
},
{
id: "A2", app: "ATIPOP", modulo: "Formularios",
keywords: ["sin dato", "formulario bloqueado", "formulario lleno", "datos corruptos", "no puedo editar", "aparece respondido"],
respuesta: "Ese error es de caché corrupta, se soluciona así:\n\n1️⃣ Ve a *Configuración del teléfono → Aplicaciones → ATIPOP → Almacenamiento*\n2️⃣ Toca *Borrar Datos* y *Borrar Caché*\n3️⃣ Vuelve a iniciar sesión y abre el formulario de nuevo\n\n⚠️ No cierres la app mientras el formulario está cargando.\n\n¿Quedó bien?"
},
{
id: "A3", app: "ATIPOP", modulo: "Sincronización",
keywords: ["no carga", "desactualizado", "informacion vieja", "no sincroniza", "sincronizacion", "datos viejos", "no aparece"],
respuesta: "El problema es de sincronización. Prueba esto:\n\n1️⃣ Presiona el botón *Sincronizar* en el menú lateral\n2️⃣ Asegúrate de tener conexión a internet estable\n3️⃣ Si no carga, cierra sesión, vuelve a entrar y sincroniza de nuevo\n\n💡 Sincroniza al inicio de cada jornada.\n\n¿Ya cargó la información?"
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
respuesta: "El envío automático de certificaciones tiene una falla conocida. Por ahora:\n\n1️⃣ Descarga la certificación manualmente desde el módulo correspondiente\n2️⃣ Envíala por correo de forma manual adjuntando el archivo\n\nYa está reportado al equipo técnico. ¿Pudiste descargarla?"
},
{
id: "A7", app: "ATIPOP", modulo: "GPS",
keywords: ["gps", "alerta", "riesgo", "emergencia", "no llega alerta", "ubicacion", "no vibra", "no notifica"],
respuesta: "Las alertas GPS pueden fallar si no están configuradas:\n\n1️⃣ Ve a *Configuración* y ajusta la *distancia de alertas GPS*\n2️⃣ Activa las *alertas por vibración*\n3️⃣ Verifica que ATIPOP tenga permisos de ubicación en tu teléfono\n\n💡 Configura las alertas al inicio de cada turno.\n\n¿Quedaron activadas?"
},
{
id: "A8", app: "ATIPOP", modulo: "Acceso",
keywords: ["olvide contrasena", "no recuerdo clave", "contrasena incorrecta", "no puedo entrar", "acceso", "login", "usuario", "clave", "sga"],
respuesta: "Para recuperar tu contraseña de ATIPOP:\n\n1️⃣ En la pantalla de inicio usa *Recuperar contraseña*\n2️⃣ Ingresa tu correo registrado\n\n⚠️ La contraseña está vinculada al sistema *SGA*. Si el correo no funciona, contacta a *Talento Humano*.\n\n¿Pudiste ingresar?"
},
{
id: "P1", app: "PREVEBSA", modulo: "Plan Diario",
keywords: ["plan anterior", "plan de ayer", "plan viejo", "plan diario", "dia anterior", "cache plan"],
respuesta: "La app quedó con datos del día anterior. Solución:\n\n1️⃣ Ve a *Configuración del teléfono → Aplicaciones → Prevebsa → Almacenamiento → Borrar caché*\n2️⃣ Reinicia la app y vuelve a ingresar\n\n💡 Cierra sesión al finalizar la jornada para evitar esto.\n\n¿Ya aparece el plan de hoy?"
}
];

// ============================================================
// SESSION STORE
// ============================================================

const sessions = {};

function getSession(phone) {
if (!sessions[phone]) {
sessions[phone] = { history: [], attempts: 0 };
}
return sessions[phone];
}

// ============================================================
// SEARCH
// ============================================================

function searchKnowledge(text) {
const lower = text.toLowerCase();

for (const entry of knowledgeBase) {
for (const keyword of entry.keywords) {
if (lower.includes(keyword)) {
return entry;
}
}
}

return null;
}

// ============================================================
// CLAUDE API
// ============================================================

async function askClaude(userMessage, history) {

const systemPrompt = `Eres el asistente de soporte técnico de ATI para los aplicativos ATIPOP y PREVEBSA.
Tu objetivo es ayudar a los técnicos de campo a resolver problemas con la app de forma rápida y clara.

REGLAS:

- Responde siempre en español
- Da soluciones paso a paso
- Siempre pregunta si el problema quedó resuelto
- Usa emojis moderadamente

CONTEXTO:
ATIPOP gestiona subestaciones eléctricas
PREVEBSA gestiona seguridad y salud en el trabajo`;

const messages = [
...history.map(h => ({ role: h.role, content: h.content })),
{ role: "user", content: userMessage }
];

const response = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": process.env.CLAUDE_API_KEY,
"anthropic-version": "2023-06-01"
},
body: JSON.stringify({
model: "claude-haiku-4-5-20251001",
max_tokens: 1024,
system: systemPrompt,
messages
})
});

const data = await response.json();
return data.content[0].text;
}

// ============================================================
// WHATSAPP
// ============================================================

async function sendWhatsApp(to, message) {

const response = await fetch(
`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
{
method: "POST",
headers: {
"Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
"Content-Type": "application/json"
},
body: JSON.stringify({
messaging_product: "whatsapp",
to,
type: "text",
text: { body: message }
})
}
);

return response.json();
}

// ============================================================
// WEBHOOK VERIFY
// ============================================================

app.get("/webhook", (req, res) => {

const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
console.log("Webhook verificado");
res.status(200).send(challenge);
} else {
res.sendStatus(403);
}

});

// ============================================================
// WEBHOOK RECEIVE
// ============================================================

app.post("/webhook", async (req, res) => {

res.sendStatus(200);

try {

const entry = req.body.entry?.[0];
const change = entry?.changes?.[0];
const message = change?.value?.messages?.[0];

if (!message || message.type !== "text") return;

const phone = message.from;
const text = message.text.body;
const session = getSession(phone);

console.log(`Mensaje de ${phone}: ${text}`);

const match = searchKnowledge(text);

if (match) {

session.attempts = 0;

session.history.push({ role: "user", content: text });
session.history.push({ role: "assistant", content: match.respuesta });

await sendWhatsApp(phone, match.respuesta);

} else {

session.attempts += 1;

if (session.attempts > 2) {

const escalation = `Lo siento, no pude resolver tu problema automáticamente 🙏

Voy a conectarte con un asesor de soporte técnico de ATI.

_Un agente te responderá en breve._ ⏳`;

await sendWhatsApp(phone, escalation);

sessions[phone] = { history: [], attempts: 0 };

} else {

const reply = await askClaude(text, session.history);

session.history.push({ role: "user", content: text });
session.history.push({ role: "assistant", content: reply });

if (session.history.length > 10)
session.history = session.history.slice(-10);

await sendWhatsApp(phone, reply);

}

}

} catch (error) {
console.error("Error:", error);
}

});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
res.json({
status: "ATI Bot funcionando ✅",
timestamp: new Date().toISOString()
});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
console.log(`ATI Bot corriendo en puerto ${PORT}`)
);
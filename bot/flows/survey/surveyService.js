// bot/flows/survey/surveyService.js
// Lógica completa de la encuesta con WhatsApp Flows: enviar, recibir respuestas,
// formatear y publicar el Flow en Meta. Listo para integrar en el bot.
// NO MODIFIQUES este archivo para cambiar preguntas: usa questions.js.

const {
  sendFlowMessage,
  sendWhatsApp,
  authHeaders,
} = require("../../services/whatsapp");
const FormData = require("form-data");
const surveyConfig = require("./questions");
const { buildSurveyFlow } = require("./flowBuilder");

const WHATSAPP_API = "https://graph.facebook.com/v19.0";

// Envía la encuesta al usuario `to` abriendo el Flow publicado.
async function sendSurvey(to, config = surveyConfig) {
  if (!config.flowId) {
    throw new Error(
      "Falta flowId. Define WHATSAPP_FLOW_ID en el .env o config.flowId en questions.js",
    );
  }
  return sendFlowMessage(
    to,
    config.introText,
    config.flowId,
    config.ctaText,
    config.flowToken,
  );
}

// Extrae la respuesta del webhook cuando el usuario completa el Flow.
// Devuelve { flowToken, responses } o null si no es una respuesta de Flow.
function parseSurveyResponse(message) {
  if (!message || message.type !== "interactive") return null;
  const interactive = message.interactive;
  if (!interactive || interactive.type !== "flow") return null;
  const flowResponse = interactive.flow_response || {};
  const responses =
    flowResponse.json_payload ||
    (flowResponse.response_json ? JSON.parse(flowResponse.response_json) : {});
  return {
    flowToken: flowResponse.flow_token,
    responses,
  };
}

// Convierte las respuestas crudas en un texto legible para notificar/guardar.
function formatSurveyAnswers(responses, config = surveyConfig) {
  const lines = [];
  for (const q of config.questions || []) {
    const value = responses ? responses[q.id] : undefined;
    if (value !== undefined && value !== null && value !== "") {
      const texto = Array.isArray(value) ? value.join(", ") : value;
      lines.push(`· ${q.title}: ${texto}`);
    }
  }
  return lines.join("\n");
}

// Acción al recibir la encuesta (placeholder de implementación).
// Reemplaza el contenido para guardar en BD o notificar a los asesores.
async function notifySurveyResult(to, responses) {
  const texto = formatSurveyAnswers(responses);
  console.log(`📝 Respuesta de encuesta de +${to}:\n${texto}`);
}

// Envía el mensaje de agradecimiento al usuario.
async function sendThankYou(to, config = surveyConfig) {
  return sendWhatsApp(to, config.thankYouMessage);
}

// ---------------------------------------------------------------------------
//  Publicación del Flow en Meta (opcional / utilidad de despliegue).
//  1. Crea el Flow en estado borrador. 2. Sube el JSON. 3. Publica.
//  Requiere WHATSAPP_TOKEN y PHONE_NUMBER_ID en el entorno.
// ---------------------------------------------------------------------------
async function publishSurveyFlow(config = surveyConfig) {
  const flowJson = JSON.stringify(buildSurveyFlow(config));
  const base = `${WHATSAPP_API}/${process.env.PHONE_NUMBER_ID}`;

  const createRes = await fetch(`${base}/flows`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      name: config.surveyName || "Encuesta ATI",
      categories: ["SURVEY"],
      clone_supported: false,
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok || createData.error) {
    throw new Error(createData.error?.message || "No se pudo crear el Flow");
  }
  const flowId = createData.id;

  const fd = new FormData();
  fd.append("name", "flow.json");
  fd.append("asset_type", "FLOW_JSON");
  fd.append("file", Buffer.from(flowJson), {
    filename: "flow.json",
    contentType: "application/json",
  });
  const uploadRes = await fetch(`${base}/${flowId}/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    body: fd,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || uploadData.error) {
    throw new Error(uploadData.error?.message || "No se pudo subir el JSON del Flow");
  }

  const publishRes = await fetch(`${base}/${flowId}/publish`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok || publishData.error) {
    throw new Error(publishData.error?.message || "No se pudo publicar el Flow");
  }

  return flowId;
}

module.exports = {
  sendSurvey,
  parseSurveyResponse,
  formatSurveyAnswers,
  notifySurveyResult,
  sendThankYou,
  publishSurveyFlow,
};

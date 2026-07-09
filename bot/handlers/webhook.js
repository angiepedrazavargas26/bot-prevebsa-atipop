// Orquestador del webhook de WhatsApp: valida incoming messages, extrae texto/interacciones y delega a agentHandler o userHandler según remitente, además de reenviar media en modo humano.

const {
  getSession,
} = require("../session");
const {
  handleAgentMessage,
  forwardToAgent,
  forwardMediaToAgent,
} = require("./agentHandler");
const { detectarNombre, processUserMessage } = require("./userHandler");
const { getAgentes, getModoHumano, getAgenteActivo } = require("../services/agent");

const AGENTES = getAgentes();
const modoHumano = getModoHumano();
const agenteActivo = getAgenteActivo();

function handleWebhook(req, res) {
  res.sendStatus(200);
  processIncomingMessage(req.body);
}

async function processIncomingMessage(body) {
  try {
    const entry = body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];
    if (!message) return;

    const tipo = message.type;
    const phone = message.from;

    if (modoHumano.has(phone) && tipo !== "text") {
      await forwardMediaToAgent({ phone, message, tipo, modoHumano, agenteActivo, AGENTES });
      return;
    }

    let text = "";
    if (tipo === "text") {
      text = message.text.body.trim();
    } else if (tipo === "interactive") {
      text =
        message.interactive?.button_reply?.id ||
        message.interactive?.button_reply?.title ||
        message.interactive?.list_reply?.id ||
        message.interactive?.list_reply?.title ||
        "";
    } else if (!AGENTES.includes(phone)) {
      return;
    }
    if (!text && !AGENTES.includes(phone)) return;

    const session = getSession(phone);

    console.log(`📩 De ${phone}: ${text}`);

    if (AGENTES.includes(phone)) {
      await handleAgentMessage({ phone, text, tipo, message, modoHumano, agenteActivo, AGENTES });
      return;
    }

    if (modoHumano.has(phone)) {
      await forwardToAgent({ phone, text, message, tipo, modoHumano, agenteActivo, AGENTES, session });
      return;
    }

    detectarNombre(text, session);

    const textLower = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    await processUserMessage({ phone, textLower, text, session, modoHumano, agenteActivo, AGENTES });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

module.exports = { handleWebhook };

// bot/services/agent.js

const AGENTES = ["573026696723", "573102614279"];
const modoHumano = new Set();
const agenteActivo = new Map();

const { sendInteractiveList, sendWhatsApp } = require("./whatsapp");

async function notificarAgentes(phone, nombre, texto) {
  const bodyText = `▣ *NUEVO CASO DE SOPORTE*\n\n· Usuario: *${nombre}* (+${phone})\n· Mensaje: "${texto}"`;
  const rows = [
    {
      id: `#agente ${phone}`,
      title: "Aceptar",
      description: "Atender este caso",
    },
    {
      id: "#rechazar",
      title: "Rechazar",
      description: "No puedo atenderlo ahora",
    },
  ];
  for (const agente of AGENTES) {
    try {
      if (!agenteActivo.has(agente)) {
        await sendWhatsApp(
          agente,
          `▣ *NUEVO CASO DISPONIBLE*\n\n· Usuario: *${nombre}* (+${phone})\n\nEscriba *#agente ${phone}* para atender o *#status* para ver todos los casos.`,
        );
      }
      await sendInteractiveList(
        agente,
        bodyText,
        "Responder solicitud",
        rows,
        "Toque una opción o escriba el comando",
      );
    } catch (e) {
      try {
        const alerta = `${bodyText}\n\nOpciones:\n› *Aceptar*: escriba *#agente ${phone}*\n› *Rechazar*: escriba *#rechazar*`;
        await sendWhatsApp(agente, alerta);
      } catch (_) {}
    }
  }
}

function getModoHumano() {
  return modoHumano;
}

function getAgenteActivo() {
  return agenteActivo;
}

function getAgentes() {
  return AGENTES;
}

module.exports = {
  notificarAgentes,
  getModoHumano,
  getAgenteActivo,
  getAgentes,
};

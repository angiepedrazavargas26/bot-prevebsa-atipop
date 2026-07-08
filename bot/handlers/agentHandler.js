// Procesa comandos de agentes/asesores y reenvío de mensajes y media entre agentes y usuarios.
// Maneja: #agente, #rechazar, #bot, #status y retransmisión de texto/media según estado.
const { getSession } = require("../session");
const { sendMenuPrincipal } = require("../menus/interactive");
const { MENSAJE_AGENTE } = require("../menus/constants");

async function handleAgentMessage({ phone, text, tipo, message, modoHumano, agenteActivo, AGENTES }) {
  if (text.startsWith("#agente ")) {
    const cliente = text.split("#agente ")[1].trim();
    let asignadoA = null;
    for (const [agente, cli] of agenteActivo.entries()) {
      if (cli === cliente) {
        asignadoA = agente;
        break;
      }
    }
    if (asignadoA && asignadoA !== phone) {
      await sendWhatsApp(phone, `⚠️ El caso de +${cliente} ya fue aceptado por otro asesor.`);
      return;
    }
    if (asignadoA === phone) return;

    modoHumano.add(cliente);
    agenteActivo.set(phone, cliente);
    await sendWhatsApp(phone, `*Asesor activo* — Atendiendo a +${cliente}\n\nEscriba normalmente y sus mensajes llegarán al usuario.\nPara terminar escriba: *#bot*`);
    await sendWhatsApp(cliente, "Un asesor de ATI está disponible. ¿En qué le puedo ayudar?");
    for (const agente of AGENTES) {
      if (agente !== phone) {
        await sendWhatsApp(agente, `✅ El caso de +${cliente} ya fue aceptado por otro asesor. No es necesario atenderlo.`);
      }
    }
    return;
  }

  if (text === "#rechazar") {
    await sendWhatsApp(phone, "Caso rechazado. Seguirás disponible para otros casos.");
    return;
  }

  if (text === "#bot") {
    const cliente = agenteActivo.get(phone);
    if (cliente) {
      modoHumano.delete(cliente);
      agenteActivo.delete(phone);
      getSession(cliente).attempts = 0;
      await sendWhatsApp(phone, `· Caso finalizado. Bot reactivado para +${cliente}`);
      await sendWhatsApp(cliente, "El asistente virtual está disponible nuevamente. 👇");
      await sendMenuPrincipal(cliente);
    } else {
      await sendWhatsApp(phone, "No tiene ningún caso activo en este momento.");
    }
    return;
  }

  if (text === "#status") {
    const clienteActivo = agenteActivo.get(phone);
    let mensaje = "📊 *Estado del asesor*\n\n";
    if (clienteActivo) {
      const sActivo = getSession(clienteActivo);
      const nombreActivo = sActivo.nombre ? sActivo.nombre : `+${clienteActivo}`;
      mensaje += `· En chat con cliente: *SÍ* (${nombreActivo} — +${clienteActivo})\n`;
    } else {
      mensaje += "· En chat con cliente: *NO*\n";
    }

    const casosDisponibles = [];
    for (const cli of modoHumano) {
      let asignado = false;
      for (const c of agenteActivo.values()) {
        if (c === cli) {
          asignado = true;
          break;
        }
      }
      if (!asignado) casosDisponibles.push(cli);
    }

    if (casosDisponibles.length > 0) {
      mensaje += `\n· Casos disponibles (${casosDisponibles.length}):\n`;
      for (const cli of casosDisponibles) {
        const s = getSession(cli);
        const nombre = s.nombre ? s.nombre : `+${cli}`;
        mensaje += `  ▸ ${nombre} — +${cli}\n`;
      }
      mensaje += "\nPara atender un caso escriba: *#agente <número>*";
    } else {
      mensaje += "\n· No hay casos disponibles en este momento.";
    }

    await sendWhatsApp(phone, mensaje);
    return;
  }

  if (agenteActivo.has(phone)) {
    const clienteActivo = agenteActivo.get(phone);
    if (tipo === "text" || tipo === "interactive") {
      await sendWhatsApp(clienteActivo, `*Asesor ATI:*\n${text}`);
      console.log(`Asesor ${phone} → Cliente ${clienteActivo}: ${text}`);
    } else {
      await reenviarMediaA(clienteActivo, message);
      console.log(`Asesor ${phone} → Cliente ${clienteActivo}: media (${tipo})`);
    }
    return;
  }

  return false;
}

async function forwardToAgent({ phone, text, message, tipo, modoHumano, agenteActivo, AGENTES, session }) {
  let agenteAsignado = null;
  for (const [agente, cliente] of agenteActivo.entries()) {
    if (cliente === phone) {
      agenteAsignado = agente;
      break;
    }
  }
  const nombreOrPhone = session.nombre ? session.nombre : `+${phone}`;
  if (agenteAsignado) {
    await sendWhatsApp(agenteAsignado, `*${nombreOrPhone}:*\n${text}`);
  } else {
    for (const agente of AGENTES) {
      try {
        await sendWhatsApp(agente, `*${nombreOrPhone}:*\n${text}\n\n_Escriba *#agente ${phone}* para atender_`);
      } catch (e) {}
    }
  }
}

async function forwardMediaToAgent({ phone, message, tipo, modoHumano, agenteActivo, AGENTES }) {
  let agenteAsignado = null;
  for (const [agente, cliente] of agenteActivo.entries()) {
    if (cliente === phone) {
      agenteAsignado = agente;
      break;
    }
  }

  const destinos = agenteAsignado ? [agenteAsignado] : AGENTES;
  for (const dest of destinos) {
    await reenviarMediaAlAsesor(dest, phone, message);
  }
}

module.exports = {
  handleAgentMessage,
  forwardToAgent,
  forwardMediaToAgent,
};

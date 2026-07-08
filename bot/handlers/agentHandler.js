// Procesa comandos de agentes/asesores y reenvío de mensajes y media entre agentes y usuarios.
// Maneja: #agente, #rechazar, #bot, #status y retransmisión de texto/media según estado.
// Aceptación de casos dinámica vía menú interactivo en #status.
const {
  sendWhatsApp,
  sendInteractiveList,
  reenviarMediaA,
  reenviarMediaAlAsesor,
} = require("../services/whatsapp");
const { getSession } = require("../session");
const { sendMenuPrincipal } = require("../menus/interactive");
const { MENSAJE_AGENTE } = require("../menus/constants");

// Menú dinámico usado en avisos sin caso activo / caso ya aceptado.
// La opción "Consultar casos disponibles" envía internamente el #status.
async function sendMenuCasosDisponibles(phone, cuerpo) {
  return sendInteractiveList(
    phone,
    cuerpo,
    "Ver opciones",
    [
      {
        id: "status",
        title: "Consultar casos disponibles",
        description: "Ver la lista de casos y aceptar uno",
      },
    ],
    "Toque una opción.",
  );
}

// Menú dinámico para cuando el asesor ya tiene un caso activo y quiere aceptar otro.
// La opción "Cerrar caso actual" envía internamente el #bot.
async function sendMenuCerrarCaso(phone, clienteActivo) {
  return sendInteractiveList(
    phone,
    `⚠️ Ya tienes un caso activo (con +${clienteActivo}). Debes cerrarlo antes de aceptar otro.`,
    "Ver opciones",
    [
      {
        id: "bot",
        title: "Cerrar caso actual",
        description: "Finaliza el caso y reactiva el bot",
      },
    ],
    "Toque una opción.",
  );
}

// Acepta un caso para el asesor `phone`. Valida que no haya sido aceptado por otro.
async function aceptarCaso({ phone, cliente, modoHumano, agenteActivo, AGENTES }) {
  if (agenteActivo.has(phone)) {
    await sendMenuCerrarCaso(phone, agenteActivo.get(phone));
    return true;
  }
  let asignadoA = null;
  for (const [agente, cli] of agenteActivo.entries()) {
    if (cli === cliente) {
      asignadoA = agente;
      break;
    }
  }
  if (asignadoA && asignadoA !== phone) {
    await sendMenuCasosDisponibles(
      phone,
      `⚠️ El caso de +${cliente} ya fue aceptado por otro asesor. No puede atenderlo.`,
    );
    return true;
  }
  if (!modoHumano.has(cliente)) {
    await sendMenuCasosDisponibles(
      phone,
      `⚠️ El caso de +${cliente} ya fue cerrado o ya no está disponible. Consulte los casos activos.`,
    );
    return true;
  }
  if (asignadoA === phone) return true;

  modoHumano.add(cliente);
  agenteActivo.set(phone, cliente);
  await sendWhatsApp(phone, `*Asesor activo* — Atendiendo a +${cliente}\n\nEscriba normalmente y sus mensajes llegarán al usuario.\nPara terminar escriba: *#bot*`);
  await sendWhatsApp(cliente, "Un asesor de ATI está disponible. ¿En qué le puedo ayudar?");
  for (const agente of AGENTES) {
    if (agente !== phone) {
      await sendWhatsApp(agente, `✅ El caso de +${cliente} ya fue aceptado por otro asesor. No es necesario atenderlo.`);
    }
  }
  return true;
}

// Construye la lista de casos disponibles (en modoHumano y aún no asignados).
function obtenerCasosDisponibles(modoHumano, agenteActivo) {
  const casos = [];
  for (const cli of modoHumano) {
    let asignado = false;
    for (const c of agenteActivo.values()) {
      if (c === cli) {
        asignado = true;
        break;
      }
    }
    if (!asignado) casos.push(cli);
  }
  return casos;
}

async function handleAgentMessage({ phone, text, tipo, message, modoHumano, agenteActivo, AGENTES }) {
  if (text.startsWith("#agente ")) {
    const cliente = text.split("#agente ")[1].trim();
    await aceptarCaso({ phone, cliente, modoHumano, agenteActivo, AGENTES });
    return;
  }

  if (text.startsWith("aceptar:")) {
    const cliente = text.split("aceptar:")[1].trim();
    await aceptarCaso({ phone, cliente, modoHumano, agenteActivo, AGENTES });
    return;
  }

  if (text === "#rechazar") {
    await sendWhatsApp(phone, "Caso rechazado. Seguirás disponible para otros casos.");
    return;
  }

  if (text === "#bot" || text === "bot") {
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

  if (text === "#status" || text === "status") {
    const clienteActivo = agenteActivo.get(phone);
    let mensaje = "📊 *Estado del asesor*\n\n";
    if (clienteActivo) {
      const sActivo = getSession(clienteActivo);
      const nombreActivo = sActivo.nombre ? sActivo.nombre : `+${clienteActivo}`;
      mensaje += `· En chat con cliente: *SÍ* (${nombreActivo} — +${clienteActivo})\n`;
    } else {
      mensaje += "· En chat con cliente: *NO*\n";
    }

    const casosDisponibles = obtenerCasosDisponibles(modoHumano, agenteActivo).slice(0, 10);

    if (casosDisponibles.length > 0) {
      const rows = casosDisponibles.map((cli) => {
        const s = getSession(cli);
        const nombre = s.nombre ? s.nombre : `+${cli}`;
        return {
          id: `aceptar:${cli}`,
          title: nombre,
          description: `+${cli}`,
        };
      });
      mensaje += `\n· Casos disponibles (${casosDisponibles.length}). Toque un caso para aceptarlo:`;
      await sendInteractiveList(phone, mensaje, "Aceptar caso", rows, "Toque un caso para atenderlo.");
    } else {
      mensaje += "\n· No hay casos disponibles en este momento.";
      await sendWhatsApp(phone, mensaje);
    }
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

  await sendMenuCasosDisponibles(
    phone,
    "⚠️ No tenés ningún caso activo. Escribí *#agente <número>* para atender a un cliente o consulte los casos disponibles.",
  );
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

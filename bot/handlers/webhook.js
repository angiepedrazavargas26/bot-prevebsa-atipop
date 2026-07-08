// bot/handlers/webhook.js

const {
  getSession,
  sessions,
} = require("../session");
const { searchKnowledge } = require("../knowledge/base");
const {
  sendMenuPrincipal,
  sendMenuPrevebsa,
  sendMenuAtipop,
  sendMenuTutoriales,
  sendMenuTutorialesPrevebsa,
  sendMenuTutorialesAtipop,
  sendMenuOpcionesPrevebsa,
  sendMenuOpcionesAtipop,
} = require("../menus/interactive");
const {
  sendWhatsApp,
  sendInteractiveList,
  sendVideoMessage,
  reenviarMediaAlAsesor,
  OPCION_ASESOR,
} = require("../services/whatsapp");
const { notificarAgentes, getModoHumano, getAgenteActivo, getAgentes } = require("../services/agent");
const { askClaude } = require("../services/claude");
const {
  MENSAJE_AGENTE,
  CONTEXTOS,
  VIDEOS_PREVEBSA,
  VIDEOS_ATIPOP,
  OPCIONES_PREVEBSA,
  OPCIONES_ATIPOP,
} = require("../menus/constants");

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
    } else {
      return;
    }
    if (!text) return;
    const session = getSession(phone);

    console.log(`📩 De ${phone}: ${text}`);

    if (AGENTES.includes(phone)) {
      if (text.startsWith("#agente ")) {
        const cliente = text.split("#agente ")[1].trim();
        modoHumano.add(cliente);
        agenteActivo.set(phone, cliente);
        await sendWhatsApp(
          phone,
          `*Asesor activo* — Atendiendo a +${cliente}\n\nEscriba normalmente y sus mensajes llegarán al usuario.\nPara terminar escriba: *#bot*`,
        );
        await sendWhatsApp(
          cliente,
          "Un asesor de ATI está disponible. ¿En qué le puedo ayudar?",
        );
        return;
      }
      if (text === "#rechazar") {
        await sendWhatsApp(
          phone,
          "Caso rechazado. Seguirás disponible para otros casos.",
        );
        return;
      }
      if (text === "#bot") {
        const cliente = agenteActivo.get(phone);
        if (cliente) {
          modoHumano.delete(cliente);
          agenteActivo.delete(phone);
          getSession(cliente).attempts = 0;
          await sendWhatsApp(
            phone,
            `· Caso finalizado. Bot reactivado para +${cliente}`,
          );
          await sendWhatsApp(
            cliente,
            "El asistente virtual está disponible nuevamente.\n\nEscriba *menu* si necesita más ayuda.",
          );
        } else {
          await sendWhatsApp(
            phone,
            "No tiene ningún caso activo en este momento.",
          );
        }
        return;
      }
      if (agenteActivo.has(phone)) {
        const clienteActivo = agenteActivo.get(phone);
        await sendWhatsApp(clienteActivo, `*Asesor ATI:*\n${text}`);
        console.log(`Asesor ${phone} → Cliente ${clienteActivo}: ${text}`);
        return;
      }
    }

    if (modoHumano.has(phone)) {
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
            await sendWhatsApp(
              agente,
              `*${nombreOrPhone}:*\n${text}\n\n_Escriba *#agente ${phone}* para atender_`,
            );
          } catch (e) {}
        }
      }
      return;
    }

    if (session.primerMensaje) {
      session.primerMensaje = false;
      await sendMenuPrincipal(phone);
      return;
    }

    const matchNombre = text.match(
      /(?:me llamo|soy|mi nombre es)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)/i,
    );
    if (matchNombre) session.nombre = matchNombre[1];

    const textLower = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (["menu", "inicio", "hola", "start", "reiniciar"].includes(textLower)) {
      Object.assign(session, {
        attempts: 0,
        history: [],
        contexto: null,
        menu: null,
        app: null,
      });
      await sendMenuPrincipal(phone);
      return;
    }

    if (session.menu === "tutoriales") {
      if (text === "0") {
        session.menu = null;
        session.app = null;
        await sendMenuPrincipal(phone);
        return;
      }
      if (text === "1") {
        session.menu = "tutoriales_prevebsa";
        await sendMenuTutorialesPrevebsa(phone);
        return;
      }
      if (text === "2") {
        session.menu = "tutoriales_atipop";
        await sendMenuTutorialesAtipop(phone);
        return;
      }
    }
    if (session.menu === "tutoriales_prevebsa") {
      if (text === "0") {
        session.menu = "tutoriales";
        await sendMenuTutoriales(phone);
        return;
      }
      const video = VIDEOS_PREVEBSA[text];
      if (video) {
        await sendWhatsApp(phone, "Enviando tutorial...");
        await sendVideoMessage(phone, video);
        await sendWhatsApp(
          phone,
          "¿Necesita ayuda con algo más? Escriba *menu* para volver." +
            OPCION_ASESOR,
        );
        return;
      }
    }
    if (session.menu === "tutoriales_atipop") {
      if (text === "0") {
        session.menu = "tutoriales";
        await sendMenuTutoriales(phone);
        return;
      }
      const video = VIDEOS_ATIPOP[text];
      if (video) {
        await sendWhatsApp(phone, "Enviando tutorial...");
        await sendVideoMessage(phone, video);
        await sendWhatsApp(
          phone,
          "¿Necesita ayuda con algo más? Escriba *menu* para volver." +
            OPCION_ASESOR,
        );
        return;
      }
    }

    const palabrasAsesor = ["asesor", "agente", "humano", "hablar con alguien"];
    if (text === "#" || palabrasAsesor.some((p) => textLower.includes(p))) {
      if (session.nombre) {
        await sendWhatsApp(phone, MENSAJE_AGENTE);
        await notificarAgentes(
          phone,
          session.nombre,
          `Solicitud de asesor. Módulo: ${session.contexto || "menú principal"}. Mensaje: "${text}"`,
        );
        modoHumano.add(phone);
      } else {
        session.esperandoNombre = true;
        await sendWhatsApp(
          phone,
          "✓ Se le conectará con un asesor.\n\n¿Cuál es su nombre completo?",
        );
      }
      return;
    }

    if (session.esperandoNombre) {
      session.nombre =
        text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      session.esperandoNombre = false;
      await sendWhatsApp(phone, MENSAJE_AGENTE);
      await notificarAgentes(
        phone,
        session.nombre,
        `Solicitud de asesor. Módulo: ${session.contexto || "menú principal"}.`,
      );
      modoHumano.add(phone);
      return;
    }

    if (!session.menu || session.menu === "principal") {
      if (text === "1" || textLower.includes("prevebsa")) {
        session.menu = "prevebsa";
        session.app = "PREVEBSA";
        session.contexto = null;
        await sendMenuPrevebsa(phone);
        return;
      }
      if (text === "2" || textLower.includes("atipop")) {
        session.menu = "atipop";
        session.app = "ATIPOP";
        session.contexto = null;
        await sendMenuAtipop(phone);
        return;
      }
      if (text === "3") {
        session.menu = "tutoriales";
        await sendMenuTutoriales(phone);
        return;
      }
    }

    if (text === "0") {
      if (session.menu && session.menu !== "principal") {
        if (session.contexto) {
          session.contexto = null;
        } else {
          session.menu = null;
          session.app = null;
        }
        if (session.menu === "prevebsa") {
          await sendMenuPrevebsa(phone);
        } else if (session.menu === "atipop") {
          await sendMenuAtipop(phone);
        } else {
          await sendMenuPrincipal(phone);
        }
      } else {
        await sendMenuPrincipal(phone);
      }
      return;
    }

    if (
      session.menu === "prevebsa" &&
      !session.contexto &&
      !session.submenu &&
      /^[1-8]$/.test(text)
    ) {
      session.submenu = "prevebsa_detalle";
      await sendMenuOpcionesPrevebsa(phone);
      return;
    }

    if (
      session.menu === "atipop" &&
      !session.contexto &&
      !session.submenu &&
      /^[1-8]$/.test(text)
    ) {
      session.submenu = "atipop_detalle";
      await sendMenuOpcionesAtipop(phone);
      return;
    }

    if (session.submenu === "prevebsa_detalle") {
      const detalle = OPCIONES_PREVEBSA[text];
      if (detalle) {
        session.submenu = null;
        session.contexto = "prevebsa_" + text;
        session.attempts = 0;
        session.history.push({ role: "user", content: detalle });
        const match = searchKnowledge(detalle, "PREVEBSA");
        if (match) {
          await sendWhatsApp(phone, match.respuesta);
          return;
        }
        const reply = await askClaude(
          detalle,
          session.history,
          session.nombre,
          CONTEXTOS[session.contexto],
          session.app,
        );
        session.history.push({ role: "assistant", content: reply });
        if (session.history.length > 12)
          session.history = session.history.slice(-12);
        await sendWhatsApp(phone, reply);
        return;
      }
    }

    if (session.menu === "prevebsa" && !session.contexto) {
      const ops = {
        1: "prevebsa_1",
        2: "prevebsa_2",
        3: "prevebsa_3",
        4: "prevebsa_4",
        5: "prevebsa_5",
        6: "prevebsa_6",
        7: "prevebsa_7",
        8: "prevebsa_8",
      };
      if (ops[text]) {
        session.contexto = ops[text];
        const preguntas = {
          prevebsa_1:
            "¿Olvidó la contraseña, su usuario aparece inactivo, o no puede ingresar con sus credenciales?" +
            OPCION_ASESOR,
          prevebsa_2:
            "¿No puede crear la planificación, se perdieron los datos, necesita reabrirla, o tiene otro inconveniente?" +
            OPCION_ASESOR,
          prevebsa_3:
            "¿No puede crear la inspección, necesita reabrirla, o no aparece para asignarla al plan diario?" +
            OPCION_ASESOR,
          prevebsa_4:
            "¿Cuál es el inconveniente con las observaciones?" + OPCION_ASESOR,
          prevebsa_5:
            "¿Cuál es el inconveniente con los planes de acción?" +
            OPCION_ASESOR,
          prevebsa_6:
            "¿Cuál es el inconveniente con el Módulo Proceso?" + OPCION_ASESOR,
          prevebsa_7:
            "¿El inconveniente es con la configuración, las notificaciones, o el modo offline?" +
            OPCION_ASESOR,
          prevebsa_8:
            "¿Cuál es el inconveniente con PREVEBSA? Cuénteme con detalle." +
            OPCION_ASESOR,
        };
        await sendWhatsApp(phone, preguntas[session.contexto]);
        return;
      }
    }

    if (session.menu === "atipop" && !session.contexto) {
      const ops = {
        1: "atipop_1",
        2: "atipop_2",
        3: "atipop_3",
        4: "atipop_4",
        5: "atipop_5",
        6: "atipop_6",
        7: "atipop_7",
        8: "atipop_8",
      };
      if (ops[text]) {
        session.contexto = ops[text];
        const preguntas = {
          atipop_1:
            "¿El inconveniente es con el inicio de sesión con *correo y contraseña*, o con *FaceID*?" +
            OPCION_ASESOR,
          atipop_2:
            "¿Cuál es el inconveniente con Mi Cuenta o Documentos?" +
            OPCION_ASESOR,
          atipop_3:
            "¿Cuál es el inconveniente con el Reporte en Ruta?" + OPCION_ASESOR,
          atipop_4:
            "¿Cuál es el inconveniente con Supervisiones e Inspecciones?" +
            OPCION_ASESOR,
          atipop_5:
            "¿El inconveniente es con *Lecturas* (medidores, valores) o con *Equipos* (historial, devolutivos)?" +
            OPCION_ASESOR,
          atipop_6:
            "¿La app no sincroniza, se queda pegada, o muestra información desactualizada?" +
            OPCION_ASESOR,
          atipop_7:
            "¿El inconveniente es con la configuración, las alertas GPS, o algo más?" +
            OPCION_ASESOR,
          atipop_8:
            "¿Cuál es el inconveniente con ATIPOP? Cuénteme con detalle." +
            OPCION_ASESOR,
        };
        await sendWhatsApp(phone, preguntas[session.contexto]);
        return;
      }
    }

    const match = searchKnowledge(text, session.app);
    if (match) {
      session.attempts = 0;
      session.history.push({ role: "user", content: text });
      session.history.push({ role: "assistant", content: match.respuesta });
      await sendWhatsApp(phone, match.respuesta);
      return;
    }

    const frasesFallo = [
      "no funciono",
      "sigue igual",
      "no sirve",
      "no pude",
      "todavia no",
      "aun no",
      "sigue el problema",
      "no se soluciono",
      "no resulto",
      "tampoco funciono",
    ];
    if (frasesFallo.some((f) => textLower.includes(f))) session.attempts++;

    if (session.attempts >= 5) {
      await sendWhatsApp(phone, MENSAJE_AGENTE);
      const nombreOrPhone = session.nombre || `+${phone}`;
      await notificarAgentes(
        phone,
        nombreOrPhone,
        `5 intentos sin resolver. Módulo: ${session.contexto || "general"}. Último mensaje: "${text}"`,
      );
      modoHumano.add(phone);
      session.attempts = 0;
      return;
    }

    const contextoActual = session.contexto
      ? CONTEXTOS[session.contexto]
      : null;
    const reply = await askClaude(
      text,
      session.history,
      session.nombre,
      contextoActual,
      session.app,
    );
    session.history.push({ role: "user", content: text });
    session.history.push({ role: "assistant", content: reply });
    if (session.history.length > 12)
      session.history = session.history.slice(-12);

    await sendWhatsApp(phone, reply);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

module.exports = { handleWebhook };

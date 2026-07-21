// Procesa la lógica del usuario final: detección de nombre, menús, tutoriales, búsqueda en knowledge, fallback a Claude, contador de intentos y solicitud de asesor.
const path = require("path");
const fs = require("fs");
const { searchKnowledge } = require("../knowledge/base");
const {
  sendMenuPrincipal,
  sendMenuPrevebsa,
  sendMenuAtipop,
  sendMenuTutoriales,
  sendMenuTutorialesPrevebsa,
  sendMenuTutorialesAtipop,
  sendMenuTipoProblema,
} = require("../menus/interactive");
const {
  sendWhatsApp,
  sendVideoMessage,
  sendImageMessage,
} = require("../services/whatsapp");
const { notificarAgentes } = require("../services/agent");
const { askClaude } = require("../services/claude");
const {
  MENSAJE_AGENTE,
  CONTEXTOS,
  VIDEOS_PREVEBSA,
  VIDEOS_ATIPOP,
  OPCIONES_PREVEBSA,
  OPCIONES_ATIPOP,
  NUMERO_ERRORES,
} = require("../menus/constants");
const { ejemplos } = require("../ejemplos");

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

async function reportarErrorNuevo(phone, descripcion, session) {
  if (!NUMERO_ERRORES) return;
  const nombre = session.nombre || `+${phone}`;
  const app = session.app || "desconocido";
  const contexto = session.contexto || "general";
  const mensaje = `⚠️ *NUEVO TIPO DE ERROR DETECTADO*\n\n· Usuario: *${nombre}* (+${phone})\n· Aplicativo: ${app}\n· Módulo: ${contexto}\n· Descripción: ${descripcion}`;
  await sendWhatsApp(NUMERO_ERRORES, mensaje);
}

function detectarNombre(text, session) {
  const matchNombre = text.match(
    /(?:(?:me llamo|soy|mi nombre es|habla (?:con|el|la))\s+(?:(?:el|la)?\s*(?:funcionario|asesor|técnico|operario|supervisor|jefe|coordinador|trabajador|empleado|funcionaria|asesora|técnica|operaria|supervisora|jefa|coordinadora|trabajadora|empleada|ingeniero|ingeniera|auxiliar|administrativo|administrativa|profesional|especialista|analista|consultor|consultora|doctor|doctora|licenciado|licenciada|abogado|abogada|arquitecto|arquitecta)?(?:\s+de\s+\w+)?\s+)?([A-Za-zÁÉÍÓÚáéíóúñÑ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúñÑ]+){0,2}))/i,
  );
  if (matchNombre) {
    const stopWords = new Set([
      "es",
      "la",
      "el",
      "de",
      "y",
      "en",
      "con",
      "por",
      "para",
      "del",
      "al",
      "lo",
      "su",
      "mi",
      "tu",
      "un",
      "una",
      "unos",
      "unas",
      "los",
      "las",
      "que",
      "le",
      "les",
      "se",
      "si",
      "no",
      "mas",
      "muy",
      "tan",
      "ya",
      "fue",
      "ser",
      "era",
      "hay",
      "vez",
      "bien",
      "aquí",
      "alli",
      "allí",
      "cada",
      "otro",
      "otra",
      "sobre",
      "entre",
      "hasta",
      "desde",
      "cuando",
      "donde",
      "como",
      "cual",
      "quien",
      "cuyo",
      "tiene",
      "tener",
      "dijo",
      "dice",
      "hace",
      "hacer",
      "sido",
      "está",
      "estar",
      "tengo",
      "puede",
      "poder",
      "quiere",
      "querer",
      "necesita",
      "necesitar",
      "sigue",
      "seguir",
      "cuenta",
      "contar",
      "informa",
      "informar",
      "avisa",
      "avisar",
      "comenta",
      "comentar",
      "expresa",
      "expresar",
      "relata",
      "relatar",
      "explica",
      "explicar",
      "describe",
      "describir",
      "detalla",
      "detallar",
      "menciona",
      "mencionar",
      "indica",
      "indicar",
      "señala",
      "señalar",
      "precisa",
      "precisar",
      "aclara",
      "aclarar",
      "afirma",
      "afirmar",
      "asegura",
      "asegurar",
      "refiere",
      "referir",
      "refirió",
      "comunicó",
      "comunicar",
      "informó",
      "manifestó",
      "manifestar",
      "señaló",
      "indicó",
      "precisó",
      "afirmó",
      "aseguró",
      "asi",
      "también",
      "solo",
      "solo",
      "pues",
      "porque",
      "aunque",
      "aunque",
      "mientras",
      "despues",
      "después",
      "antes",
      "luego",
      "entonces",
      "ademas",
      "además",
      "incluso",
      "aunque",
      "aunque",
      "debido",
      "causa",
      "razon",
      "razón",
      "motivo",
      "fin",
      "fin",
      "solo",
      "sólo",
    ]);
    const palabras = matchNombre[1].trim().split(/\s+/);
    const palabrasValidas = palabras.filter(
      (p) => p.length > 1 && !stopWords.has(p.toLowerCase()),
    );
    if (palabrasValidas.length > 0) {
      session.nombre = palabrasValidas.join(" ");
    }
  }
}

async function handleTutorialMenu({ phone, text, session }) {
  if (text === "0") {
    session.menu = null;
    session.app = null;
    await sendMenuPrincipal(phone);
    return true;
  }
  if (text === "1") {
    session.menu = "tutoriales_prevebsa";
    await sendMenuTutorialesPrevebsa(phone);
    return true;
  }
  if (text === "2") {
    session.menu = "tutoriales_atipop";
    await sendMenuTutorialesAtipop(phone);
    return true;
  }
  return false;
}

async function sendVideoIfAvailable({ phone, text, videos }) {
  const video = videos[text];
  if (!video) return false;
  await sendWhatsApp(phone, "Enviando tutorial...");
  await sendVideoMessage(phone, video);
  await sendWhatsApp(
    phone,
    "¿Necesita ayuda con algo más? Escriba *menu* para volver." + OPCION_ASESOR,
  );
  return true;
}

async function handleTutorialesPrevebsa({ phone, text, session }) {
  if (text === "0") {
    session.menu = "tutoriales";
    await sendMenuTutoriales(phone);
    return true;
  }
  return sendVideoIfAvailable({ phone, text, videos: VIDEOS_PREVEBSA });
}

async function handleTutorialesAtipop({ phone, text, session }) {
  if (text === "0") {
    session.menu = "tutoriales";
    await sendMenuTutoriales(phone);
    return true;
  }
  return sendVideoIfAvailable({ phone, text, videos: VIDEOS_ATIPOP });
}

async function handleMainMenu({ phone, textLower, text, session }) {
  if (text === "1" || textLower.includes("prevebsa")) {
    session.menu = "prevebsa";
    session.app = "PREVEBSA";
    session.contexto = null;
    await sendMenuPrevebsa(phone);
    return true;
  }
  if (text === "2" || textLower.includes("atipop")) {
    session.menu = "atipop";
    session.app = "ATIPOP";
    session.contexto = null;
    await sendMenuAtipop(phone);
    return true;
  }
  if (text === "3") {
    session.menu = "tutoriales";
    await sendMenuTutoriales(phone);
    return true;
  }
  return false;
}

async function handleBackNavigation({ phone, text, session }) {
  if (text !== "0") return false;
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
    return true;
  }
  await sendMenuPrincipal(phone);
  return true;
}

async function handleDetallePrevebsa({ phone, text, session }) {
  const detalle = OPCIONES_PREVEBSA[text];
  if (!detalle) return false;
  session.submenu = null;
  session.contexto = "prevebsa_" + text;
  session.attempts = 0;
  session.history.push({ role: "user", content: detalle });
  const match = searchKnowledge(detalle, "PREVEBSA");
  if (match) {
    await sendWhatsApp(phone, match.respuesta);
    return true;
  }
  const { text: reply, toolCalls } = await askClaude(
    detalle,
    session.history,
    session.nombre,
    CONTEXTOS[session.contexto],
    session.app,
  );
  if (toolCalls && toolCalls.length > 0) {
    for (const call of toolCalls) {
      if (call.name === "reportar_error_nuevo" && call.input?.descripcion) {
        await reportarErrorNuevo(phone, call.input.descripcion, session);
      }
    }
  }
  const respuestaFinal = reply || "Este tipo de inconveniente requiere verificación especializada. Un asesor le contactará pronto. Si necesita ayuda ahora, escriba *#* para hablar con un asesor.";
  session.history.push({ role: "assistant", content: respuestaFinal });
  if (session.history.length > 12) session.history = session.history.slice(-12);
  await sendWhatsApp(phone, respuestaFinal);
  return true;
}

async function handleOpcionesPrevebsa({ phone, text, session }) {
  if (
    session.menu === "prevebsa" &&
    !session.contexto &&
    !session.submenu &&
    /^[1-8]$/.test(text)
  ) {
    session.submenu = "prevebsa_detalle";
    return handleDetallePrevebsa({ phone, text, session });
  }
  if (session.submenu === "prevebsa_detalle") {
    return handleDetallePrevebsa({ phone, text, session });
  }
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
    session.submenu = null;
    session.attempts = 0;
    return handleDetallePrevebsa({ phone, text, session });
  }
  return false;
}

async function handleDetalleAtipop({ phone, text, session }) {
  const detalle = OPCIONES_ATIPOP[text];
  if (!detalle) return false;
  session.submenu = null;
  session.contexto = "atipop_" + text;
  session.attempts = 0;
  session.history.push({ role: "user", content: detalle });
  const match = searchKnowledge(detalle, "ATIPOP");
  if (match) {
    await sendWhatsApp(phone, match.respuesta);
    return true;
  }
  const { text: reply, toolCalls } = await askClaude(
    detalle,
    session.history,
    session.nombre,
    CONTEXTOS[session.contexto],
    session.app,
  );
  if (toolCalls && toolCalls.length > 0) {
    for (const call of toolCalls) {
      if (call.name === "reportar_error_nuevo" && call.input?.descripcion) {
        await reportarErrorNuevo(phone, call.input.descripcion, session);
      }
    }
  }
  const respuestaFinal = reply || "Este tipo de inconveniente requiere verificación especializada. Un asesor le contactará pronto. Si necesita ayuda ahora, escriba *#* para hablar con un asesor.";
  session.history.push({ role: "assistant", content: respuestaFinal });
  if (session.history.length > 12) session.history = session.history.slice(-12);
  await sendWhatsApp(phone, respuestaFinal);
  return true;
}

async function handleOpcionesAtipop({ phone, text, session }) {
  if (
    session.menu === "atipop" &&
    !session.contexto &&
    !session.submenu &&
    /^[1-8]$/.test(text)
  ) {
    session.submenu = "atipop_detalle";
    return handleDetalleAtipop({ phone, text, session });
  }
  if (session.submenu === "atipop_detalle") {
    return handleDetalleAtipop({ phone, text, session });
  }
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
    session.submenu = null;
    session.attempts = 0;
    return handleDetalleAtipop({ phone, text, session });
  }
  return false;
}

const ENCUESTA_PASOS = [
  { key: "nombre", pregunta: "¿Cuál es su nombre completo?" },
  { key: "aplicativo", pregunta: "¿Qué aplicativo le falla?" },
  { key: "version", pregunta: "¿Qué versión tiene instalada?" },
  { key: "correo", pregunta: "¿Cual es su correo vinculado a la aplicacion?" },
];

const ENCUESTA_RAMAS = {
  error: [
    { key: "modulo", pregunta: "¿En qué modulo presenta el fallo?" },
    { key: "accion", pregunta: "¿Qué acción estaba realizando?" },
    { key: "error", pregunta: "Describa el error sucedido" },
  ],
  peticion: [
    { key: "ayuda", pregunta: "¿En qué desea que le ayudemos?" },
    { key: "razon", pregunta: "Describa la razon de su solicitud" },
  ],
};

// const ejemplos = {
//   pasos: [
//     {
//       question: "version",
//       text: "si no sabe cual es la version del aplicativo por favor revise las siguientes imagenes",
//     },
//   ],
//   error: [
//     { question: "modulo", text: "" },
//     { question: "accion", text: "" },
//     { question: "error", text: "" },
//   ],
//   peticion: [
//     { question: "ayuda", text: "" },
//     { question: "razon", text: "" },
//   ],
// };

const PRUEBA_DE_BOT_RESPUESTAS = {
  error: {
    nombre: "Usuario Prueba",
    correo: "prueba@test.com",
    aplicativo: "PREVEBSA",
    version: "1.0",
    seccion: "Login",
    accion: "Ingreso",
    error: "Prueba de bot - error de prueba",
  },
  peticion: {
    nombre: "Usuario Prueba",
    correo: "prueba@test.com",
    aplicativo: "PREVEBSA",
    version: "1.0",
    ayuda: "Reabrir plan diario",
    razon: "Prueba de bot - petición de prueba",
  },
};

async function handlePruebaDeBot({
  phone,
  session,
  modoHumano,
  rama = "error",
}) {
  const respuestas = { ...PRUEBA_DE_BOT_RESPUESTAS[rama] };
  session.encuestaRespuestas = respuestas;
  session.encuestaPaso = null;
  session.encuestaRama = null;
  session.nombre = respuestas.nombre;
  const encuestaTexto = Object.entries(respuestas)
    .map(([key, value]) => `· ${key}: ${value}`)
    .join("\n");
  await notificarAgentes(
    phone,
    session.nombre,
    `Encuesta de soporte (prueba de bot - ${rama}):\n${encuestaTexto}`,
  );
  await sendWhatsApp(phone, MENSAJE_AGENTE);
  modoHumano.add(phone);
}

async function requestAgentAssistance({ phone, session, text, modoHumano }) {
  session.encuestaRespuestas = {};
  session.encuestaPaso = 0;
  if (session.nombre) {
    session.encuestaRespuestas.nombre = session.nombre;
    session.encuestaPaso = 1;
  }
  if (session.encuestaPaso < ENCUESTA_PASOS.length) {
    await sendWhatsApp(
      phone,
      "✓ Se le conectará con un asesor.\n\n" +
        ENCUESTA_PASOS[session.encuestaPaso].pregunta,
    );
  }
  return true;
}

async function handleEsperandoNombre({ phone, text, session, modoHumano }) {
  session.nombre = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  session.encuestaPaso = null;
  await sendWhatsApp(phone, MENSAJE_AGENTE);
  await notificarAgentes(
    phone,
    session.nombre,
    `Solicitud de asesor. Módulo: ${session.contexto || "menú principal"}.`,
  );
  modoHumano.add(phone);
}

async function handleEncuestaPaso({ phone, text, session, modoHumano }) {
  if (session.encuestaRama === "esperando_tipo") {
    if (text === "error" || text === "peticion") {
      session.encuestaRama = text;
      const rama = ENCUESTA_RAMAS[text];
      session.encuestaPaso = 0;

      const listaEjemplos =
        text === "error" ? ejemplos.error : ejemplos.peticion;
      const ejemplo = listaEjemplos.find((e) => e.question === rama[0].key);
      let mensaje = rama[0].pregunta;
      if (ejemplo && ejemplo.text) {
        mensaje += `\n\n> ${ejemplo.text}`;
      }
      await sendWhatsApp(phone, mensaje);
      return true;
    }
    await sendWhatsApp(phone, "Por favor seleccione una opción del menú.");
    return true;
  }

  const paso = session.encuestaPaso;
  const rama =
    session.encuestaRama === "error"
      ? ENCUESTA_RAMAS.error
      : session.encuestaRama === "peticion"
        ? ENCUESTA_RAMAS.peticion
        : ENCUESTA_PASOS;

  const pasoInfo = rama[paso];
  session.encuestaRespuestas[pasoInfo.key] = text;
  const siguientePaso = paso + 1;

  if (!session.encuestaRama && paso === 3) {
    session.encuestaRama = "esperando_tipo";
    await sendMenuTipoProblema(phone);
    return true;
  }

  if (siguientePaso < rama.length) {
    session.encuestaPaso = siguientePaso;
    const siguientePasoInfo = rama[siguientePaso];

    const listaEjemplos = !session.encuestaRama
      ? ejemplos.pasos
      : session.encuestaRama === "error"
        ? ejemplos.error
        : ejemplos.peticion;

    const ejemplo = listaEjemplos.find(
      (e) => e.question === siguientePasoInfo.key,
    );

    let mensaje = siguientePasoInfo.pregunta;
    if (ejemplo && ejemplo.text) {
      mensaje += `\n\n> ${ejemplo.text}`;
    }

    if (siguientePasoInfo.key === "version") {
      const app = (session.encuestaRespuestas.aplicativo || "").toLowerCase();
      const prefijo = app.includes("atipop") ? "atipop" : "prevebsa";
      const basePath = path.join(__dirname, "..", "ejemplos");
      await sendWhatsApp(phone, mensaje);
      for (let i = 1; i <= 2; i++) {
        const searchBase = path.join(basePath, `${prefijo} ${i}`);
        const found = fs
          .readdirSync(basePath)
          .find(
            (f) =>
              path.basename(f, path.extname(f)) === path.basename(searchBase),
          );
        if (found) {
          await sendImageMessage(phone, path.join(basePath, found));
        }
      }
      return true;
    }

    await sendWhatsApp(phone, mensaje);
    return true;
  }

  const nombre = session.encuestaRespuestas.nombre || `+${phone}`;
  session.nombre = nombre;
  session.encuestaPaso = null;
  session.encuestaRama = null;
  const encuestaTexto = Object.entries(session.encuestaRespuestas)
    .map(([key, value]) => `· ${key}: ${value}`)
    .join("\n");
  await notificarAgentes(
    phone,
    nombre,
    `Encuesta de soporte:\n${encuestaTexto}`,
  );
  await sendWhatsApp(phone, MENSAJE_AGENTE);
  modoHumano.add(phone);
  return true;
}

async function resolveWithKnowledgeOrClaude({ phone, text, session }) {
  const match = searchKnowledge(text, session.app);
  if (match) {
    session.attempts = 0;
    session.history.push({ role: "user", content: text });
    session.history.push({ role: "assistant", content: match.respuesta });
    await sendWhatsApp(phone, match.respuesta);
    return true;
  }
  return false;
}

const { forwardToAgent } = require("./agentHandler");

async function processUserMessage({
  phone,
  textLower,
  text,
  session,
  modoHumano,
  agenteActivo,
  AGENTES,
}) {
  if (modoHumano.has(phone)) {
    await forwardToAgent({
      phone,
      text,
      modoHumano,
      agenteActivo,
      AGENTES,
      session,
    });
    return true;
  }

  if (session.primerMensaje) {
    session.primerMensaje = false;
    await sendMenuPrincipal(phone);
    return true;
  }

  if (["menu", "inicio", "hola", "start", "reiniciar"].includes(textLower)) {
    Object.assign(session, {
      attempts: 0,
      history: [],
      contexto: null,
      menu: null,
      app: null,
    });
    await sendMenuPrincipal(phone);
    return true;
  }

  if (session.menu === "tutoriales") {
    const handled = await handleTutorialMenu({ phone, text, session });
    if (handled) return true;
  }

  if (session.menu === "tutoriales_prevebsa") {
    const handled = await handleTutorialesPrevebsa({ phone, text, session });
    if (handled) return true;
  }
  if (session.menu === "tutoriales_atipop") {
    const handled = await handleTutorialesAtipop({ phone, text, session });
    if (handled) return true;
  }

  if (text === "#pruebadebot") {
    return handlePruebaDeBot({ phone, session, modoHumano, rama: "error" });
  }
  if (text === "#pruebaboterror") {
    return handlePruebaDeBot({ phone, session, modoHumano, rama: "error" });
  }
  if (text === "#pruebabotpeticion") {
    return handlePruebaDeBot({ phone, session, modoHumano, rama: "peticion" });
  }

  if (session.encuestaPaso !== null) {
    await handleEncuestaPaso({ phone, text, session, modoHumano });
    return true;
  }

  if (text === "#") {
    return requestAgentAssistance({ phone, session, text, modoHumano });
  }
  const palabrasAsesor = ["asesor", "agente", "humano", "hablar con alguien"];
  if (palabrasAsesor.some((p) => textLower.includes(p))) {
    return requestAgentAssistance({ phone, session, text, modoHumano });
  }

  if (!session.menu || session.menu === "principal") {
    const principalHandled = await handleMainMenu({
      phone,
      textLower,
      text,
      session,
    });
    if (principalHandled) return true;
  }

  const backHandled = await handleBackNavigation({ phone, text, session });
  if (backHandled) return true;

  if (session.menu === "prevebsa") {
    const handled = await handleOpcionesPrevebsa({ phone, text, session });
    if (handled) return true;
  }
  if (session.menu === "atipop") {
    const handled = await handleOpcionesAtipop({ phone, text, session });
    if (handled) return true;
  }

  const knowledgeHandled = await resolveWithKnowledgeOrClaude({
    phone,
    text,
    session,
  });
  if (knowledgeHandled) return true;

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
    return true;
  }

  const contextoActual = session.contexto ? CONTEXTOS[session.contexto] : null;
  const { text: reply, toolCalls } = await askClaude(
    text,
    session.history,
    session.nombre,
    contextoActual,
    session.app,
  );
  if (toolCalls && toolCalls.length > 0) {
    for (const call of toolCalls) {
      if (call.name === "reportar_error_nuevo" && call.input?.descripcion) {
        await reportarErrorNuevo(phone, call.input.descripcion, session);
      }
    }
  }
  const respuestaFinal = reply || "Este tipo de inconveniente requiere verificación especializada. Un asesor le contactará pronto. Si necesita ayuda ahora, escriba *#* para hablar con un asesor.";
  session.history.push({ role: "user", content: text });
  session.history.push({ role: "assistant", content: respuestaFinal });
  if (session.history.length > 12) session.history = session.history.slice(-12);
  await sendWhatsApp(phone, respuestaFinal);
  return true;
}

module.exports = {
  detectarNombre,
  processUserMessage,
};

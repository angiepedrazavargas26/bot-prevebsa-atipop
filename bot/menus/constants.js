// bot/menus/constants.js

const { CONTEXTOS } = require("../contextos");

const OPCION_ASESOR = "\n\n_Escriba *#* para hablar con un asesor_";

const NUMERO_ERRORES = process.env.NUMERO_ERRORES || "";

const MENSAJE_AGENTE = `Disculpe los inconvenientes.

Un asesor de ATI le responderá en breve desde este número. 

Si desea, comparta más detalles o una captura de pantalla para agilizar la atención.`;

// const MENU_OPCIONES_PREVEBSA = `Seleccione el detalle del problema en PREVEBSA:

// 1️⃣ Problemas al ingresar / recuperar contraseña
// 2️⃣ Problemas al crear o gestionar el plan diario
// 3️⃣ Problemas al crear o gertionar Inspecciones preoperacionales
// 4️⃣ Problemas al crear o gestionar observaciones
// 5️⃣ Problemas al crear o gestionar Planes de Acción
// 6️⃣ Problemas con el Módulo Proceso
// 7️⃣ Problemas con configuración / modo offline
// 8️⃣ Otro problema en PREVEBSA

// Responda con el número para que el mensaje se genere automáticamente.`;

// const MENU_OPCIONES_ATIPOP = `

// 1️⃣ Problemas de inicio de sesión (SGA / FaceID)
// 2️⃣ Mi Cuenta / Documentos / carnet
// 3️⃣ Reporte en Ruta
// 4️⃣ Supervisiones e Inspecciones
// 5️⃣ Lecturas o equipos
// 6️⃣ Sincronización de datos
// 7️⃣ Configuración / GPS / alertas
// 8️⃣ Otro problema en ATIPOP

// Responda con el número para que el mensaje se genere automáticamente.`;

const OPCIONES_PREVEBSA = {
  1: "el usuario se encuentra ubicado en el login de la aplicacion",
  2: "el usuario se encuentra ubicado en el modulo de plan diario (ft-ms-14 o 20)",
  3: "",
  4: "",
  5: "",
  6: "",
  7: "",
  8: "",
};

const OPCIONES_ATIPOP = {
  1: "",
  2: "",
  3: "",
  4: "",
  5: "",
  6: "",
  7: "",
  8: "",
};

const VIDEOS_PREVEBSA = {
  1: {
    url: "https://drive.google.com/uc?export=download&id=1xiZ9qBOp7W8zb9sEfs-3U9v-1aLHUsYQ",
    titulo: "Tutorial: Login en PREVEBSA",
  },
  2: {
    url: "https://drive.google.com/uc?export=download&id=1PBIMBI4J3g_190G36qAqIUmXLTFRSK8o",
    titulo: "Tutorial: Plan Diario en PREVEBSA",
  },
  3: {
    url: "https://drive.google.com/uc?export=download&id=18pB2VkBHclcIMpUDGwwUySY2-C45GIAL",
    titulo: "Tutorial: Inspecciones planeadas en PREVEBSA",
  },
  4: {
    url: "https://drive.google.com/uc?export=download&id=1K-F66G0Mu4vHzF9-vrt42QnUoGUrEDLR",
    titulo: "Tutorial: Cómo borrar caché",
  },
};

const VIDEOS_ATIPOP = {
  1: {
    url: "https://drive.google.com/uc?export=download&id=1PkSvTmNZoZ69VLwDIgc5QoiVl9edDYkl",
    titulo: "Tutorial: Inicio de sesión con FaceID en ATIPOP",
  },
  2: {
    url: "https://drive.google.com/uc?export=download&id=1wbArXIY2ajQcLM0kWfcyOaaA2N_WTkwi",
    titulo: "Tutorial: Registro de asistencia en ATIPOP",
  },
  3: {
    url: "https://drive.google.com/uc?export=download&id=1jPswGIwLkJ60pwjtYWv4kulGXnpGi4Yv",
    titulo: "Tutorial: Cómo registrar FaceID en ATIPOP",
  },
  4: {
    url: "https://drive.google.com/uc?export=download&id=115kK2LCCS43mfD2S9wWJ266zmzdl_LvZ",
    titulo: "Tutorial: Login con correo y contraseña en ATIPOP",
  },
  5: {
    url: "https://drive.google.com/uc?export=download&id=1-tVGXmw_NqvBqTgX7Wkc0nMURgLXSOrh",
    titulo: "Tutorial: Recuperar contraseña ATIPOP",
  },
};

module.exports = {
  OPCION_ASESOR,
  CONTEXTOS,
  NUMERO_ERRORES,
  MENSAJE_AGENTE,
  MENU_OPCIONES_PREVEBSA,
  MENU_OPCIONES_ATIPOP,
  OPCIONES_PREVEBSA,
  OPCIONES_ATIPOP,
  VIDEOS_PREVEBSA,
  VIDEOS_ATIPOP,
};

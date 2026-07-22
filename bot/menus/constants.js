// bot/menus/constants.js

const { CONTEXTOS } = require("../contextos");

const OPCION_ASESOR = "\n\n_Escriba *#* para hablar con un asesor_";

const NUMERO_ERRORES = process.env.NUMERO_ERRORES || "";

const MENSAJE_AGENTE = `Disculpe los inconvenientes.

Un asesor de ATI le responderá en breve desde este número. 

Si desea, comparta más detalles o una captura de pantalla para agilizar la atención.`;

const OPCIONES_PREVEBSA = {
  1: "Necesito ayuda con el inicio de sesión / contraseña",
  2: "Necesito ayuda con el plan diario",
  3: "Necesito ayuda con inspecciones preoperacionales",
  4: "Necesito ayuda con observaciones",
  5: "Necesito ayuda con planes de acción",
  6: "Necesito ayuda con el módulo proceso",
  7: "Necesito ayuda con configuración / modo offline",
  8: "Otro problema en PREVEBSA",
};

const OPCIONES_ATIPOP = {
  1: "Necesito ayuda con el inicio de sesión",
  2: "Necesito ayuda con mi cuenta / documentos",
  3: "Necesito ayuda con el reporte en ruta",
  4: "Necesito ayuda con supervisiones e inspecciones",
  5: "Necesito ayuda con lecturas / equipos",
  6: "Necesito ayuda con sincronización",
  7: "Necesito ayuda con configuración / GPS / alertas",
  8: "Otro problema en ATIPOP",
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
  5: {
    url: "https://drive.google.com/uc?export=download&id=",
    titulo: "",
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

const NUMERO_NUEVOS_ERRORES = "573026696723";

module.exports = {
  OPCION_ASESOR,
  CONTEXTOS,
  NUMERO_ERRORES,
  NUMERO_NUEVOS_ERRORES,
  MENSAJE_AGENTE,
  // MENU_OPCIONES_PREVEBSA,
  // MENU_OPCIONES_ATIPOP,
  OPCIONES_PREVEBSA,
  OPCIONES_ATIPOP,
  VIDEOS_PREVEBSA,
  VIDEOS_ATIPOP,
};

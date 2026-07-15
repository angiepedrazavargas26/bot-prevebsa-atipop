// bot/menus/constants.js

const OPCION_ASESOR = "\n\n_Escriba *#* para hablar con un asesor_";

const CONTEXTOS = {
  prevebsa_1: "Login o recuperación de contraseña en PREVEBSA",
  prevebsa_2:
    "Planificaciones en PREVEBSA. Solo hay 2 formatos: Con Energía y Sin Energía",
  prevebsa_3:
    "Inspecciones Preoperacionales en PREVEBSA. Hay 3 formatos: Vehículo, Moto, Equipos Críticos",
  prevebsa_4: "Observaciones en PREVEBSA",
  prevebsa_5: "Planes de Acción en PREVEBSA",
  prevebsa_6: "Módulo Proceso en PREVEBSA",
  prevebsa_7: "Configuración o Notificaciones en PREVEBSA",
  prevebsa_8: "Problema general en PREVEBSA. NO mencione ATIPOP ni FaceID",
  atipop_1:
    "Login en ATIPOP. Puede ser con correo/contraseña (SGA) o FaceID — son flujos distintos, pregunte cuál",
  atipop_2: "Mi Cuenta o Documentos en ATIPOP",
  atipop_3: "Reporte en Ruta en ATIPOP",
  atipop_4: "Supervisiones e Inspecciones en ATIPOP. NO mencione FaceID",
  atipop_5: "Lecturas o Equipos en ATIPOP. NO mencione FaceID",
  atipop_6: "Sincronización en ATIPOP",
  atipop_7: "Configuración, GPS o Alertas en ATIPOP",
  atipop_8:
    "Problema general en ATIPOP. NO mencione PREVEBSA. NO mencione FaceID a menos que el usuario lo indique",
};

const MENSAJE_AGENTE = `Disculpe los inconvenientes.

Un asesor de ATI le responderá en breve desde este número. 

Si desea, comparta más detalles o una captura de pantalla para agilizar la atención.`;

const MENU_OPCIONES_PREVEBSA = `Seleccione el detalle del problema en PREVEBSA:

1️⃣ No puedo ingresar / recuperar contraseña
2️⃣ No guarda o se pierden los datos
3️⃣ No puedo crear o reabrir planificaciones
4️⃣ La inspección se cierra o no aparece
5️⃣ No guarda imágenes o fotos
6️⃣ No llegan notificaciones
7️⃣ Problemas con configuración / modo offline
8️⃣ Otro problema en PREVEBSA

Responda con el número para que el mensaje se genere automáticamente.`;

const MENU_OPCIONES_ATIPOP = `Seleccione el detalle del problema en ATIPOP:

1️⃣ Problemas de inicio de sesión (SGA / FaceID)
2️⃣ Mi Cuenta / Documentos / carnet
3️⃣ Reporte en Ruta
4️⃣ Supervisiones e Inspecciones
5️⃣ Lecturas o equipos
6️⃣ Sincronización de datos
7️⃣ Configuración / GPS / alertas
8️⃣ Otro problema en ATIPOP

Responda con el número para que el mensaje se genere automáticamente.`;

const OPCIONES_PREVEBSA = {
  1: "Tengo un problema en PREVEBSA con el ingreso o la recuperación de contraseña. No puedo entrar con mi usuario y necesito recuperar el acceso.",
  2: "En PREVEBSA no se guardan los cambios o se pierden los datos. Necesito ayuda para que el plan quede registrado correctamente.",
  3: "No puedo crear ni reabrir una planificación en PREVEBSA. Necesito saber cómo continuar o corregir la planificación.",
  4: "La inspección en PREVEBSA se cerró sola o no aparece en el plan diario. Necesito saber qué hacer para que aparezca.",
  5: "En PREVEBSA las imágenes no se guardan o no suben. Necesito ayuda para que las fotos y evidencias queden registradas.",
  6: "En PREVEBSA no llegan las notificaciones o hay problemas con los avisos. Necesito que me indiquen cómo activar las notificaciones.",
  7: "Tengo un problema con la configuración de PREVEBSA: modo offline, segundo plano o notificaciones. Necesito ayuda para ajustar estos parámetros.",
  8: "Tengo otro problema con PREVEBSA y necesito asistencia técnica puntual.",
};

const OPCIONES_ATIPOP = {
  1: "Tengo un problema en ATIPOP con el inicio de sesión: no puedo entrar con correo/contraseña o FaceID.",
  2: "Tengo un problema en ATIPOP con Mi Cuenta, documentos o carnet. Necesito ayuda para acceder a esos datos.",
  3: "Tengo un problema con Reporte en Ruta en ATIPOP y necesito saber cómo crear o enviar el reporte correctamente.",
  4: "Tengo un problema con Supervisiones e Inspecciones en ATIPOP y necesito ayuda para registrarlas o completar el proceso.",
  5: "Tengo un problema con Lecturas o Equipos en ATIPOP: no puedo registrar valores o no encuentro el equipo.",
  6: "ATIPOP no sincroniza bien, los datos están desactualizados o no carga información. Necesito ayuda con la sincronización.",
  7: "Tengo un problema en ATIPOP con la configuración, GPS o alertas y necesito asistencia para ajustar esos parámetros.",
  8: "Tengo otro problema con ATIPOP y necesito asistencia técnica puntual.",
};

const VIDEOS_PREVEBSA = {
  1: {
    url: "https://drive.google.com/uc?export=download&id=1xiZ9qBOp7W8zb9sEfs-3U9v-1aLHUsYQ",
    titulo: "Tutorial: Login en PREVEBSA",
  },
  2: {
    url: "https://drive.google.com/uc?export=download&id=1r3XjnUIWM8T8lEXptBJKMUmZ09SF8SJ4",
    titulo: "Tutorial: Plan Diario en PREVEBSA",
  },
  3: {
    url: "https://drive.usercontent.google.com/download?id=1ZCh68eyUU9y9Roh8hAVgYmfMpsoH_puX&export=download&authuser=0&confirm=t&uuid=958b0f4f-bb52-44b0-ba5b-35a1cd888ba2&at=ABswASalrUxvKvzxAsU3Gu6xvt9q:1784133070679",
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
  MENSAJE_AGENTE,
  MENU_OPCIONES_PREVEBSA,
  MENU_OPCIONES_ATIPOP,
  OPCIONES_PREVEBSA,
  OPCIONES_ATIPOP,
  VIDEOS_PREVEBSA,
  VIDEOS_ATIPOP,
};

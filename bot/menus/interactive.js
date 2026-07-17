// bot/menus/interactive.js

const { sendInteractiveList } = require("../services/whatsapp");

async function sendMenuPrincipal(to) {
  return sendInteractiveList(
    to,
    "✦ Bienvenido al soporte técnico de *ATI*\n\n¿Con cuál aplicativo necesita ayuda?",
    "Seleccionar menú",
    [
      {
        id: "1",
        title: "PREVEBSA",
        description: "Seguridad y salud en el trabajo (HSE)",
      },
      {
        id: "2",
        title: "ATIPOP",
        description: "Operación, montaje y mantenimiento eléctrico",
      },
      { id: "3", title: "TUTORIALES", description: "Videos paso a paso" },
      {
        id: "#",
        title: "Contactar con un asesor",
        description: "Hablar con un asesor",
      },
    ],
    "Toque una opción o escriba el número.",
  );
}

async function sendMenuPrevebsa(to) {
  return sendInteractiveList(
    to,
    "📱 *PREVEBSA* — ¿En qué le ayudo?",
    "Seleccionar opción",
    [
      {
        id: "1",
        title: "Login / Contraseña",
        description: "Problemas para ingresar o recuperar clave",
      },
      {
        id: "2",
        title: "Planificaciones",
        description: "Crear o gestionar el plan diario",
      },
      {
        id: "3",
        title: "Inspecciones preoperacionales",
        description: "Vehículo, moto o equipos críticos",
      },
      {
        id: "4",
        title: "Observaciones",
        description: "Registrar hallazgos en campo",
      },
      {
        id: "5",
        title: "Planes de Acción",
        description: "Seguimiento a hallazgos y correctivos",
      },
      {
        id: "6",
        title: "Módulo Proceso",
        description: "Seguimiento de envíos e imágenes",
      },
      {
        id: "7",
        title: "Configuración / Notificaciones",
        description: "Modo offline, segundo plano, alertas",
      },
      {
        id: "8",
        title: "Otro problema",
        description: "Inconveniente no listado",
      },
      { id: "0", title: "Volver", description: "Regresar al menú anterior" },
      {
        id: "#",
        title: "Contactar con un asesor",
        description: "Hablar con un asesor",
      },
    ],
    "Toque una opción o escriba el número.",
  );
}

async function sendMenuAtipop(to) {
  return sendInteractiveList(
    to,
    "📱 *ATIPOP* — ¿En qué le ayudo?",
    "Seleccionar opción",
    [
      {
        id: "1",
        title: "Inicio de sesión",
        description: "Problemas con correo, contraseña o FaceID",
      },
      {
        id: "2",
        title: "Mi Cuenta / Documentos",
        description: "Perfil, carnet, nómina, vehículo",
      },
      {
        id: "3",
        title: "Reporte en Ruta",
        description: "Crear o gestionar reportes diarios",
      },
      {
        id: "4",
        title: "Supervisiones e Inspecciones",
        description: "Registrar supervisiones o inspecciones",
      },
      {
        id: "5",
        title: "Lecturas / Equipos",
        description: "Medidores, valores, equipos asignados",
      },
      {
        id: "6",
        title: "Sincronización",
        description: "Datos desactualizados o sin cargar",
      },
      {
        id: "7",
        title: "Configuración / GPS / Alertas",
        description: "Distancia GPS, vibración, segundo plano",
      },
      {
        id: "8",
        title: "Otro problema",
        description: "Inconveniente no listado",
      },
      { id: "0", title: "Volver", description: "Regresar al menú anterior" },
      {
        id: "#",
        title: "Contactar con un asesor",
        description: "Hablar con un asesor",
      },
    ],
    "Toque una opción o escriba el número.",
  );
}

async function sendMenuTutoriales(to) {
  return sendInteractiveList(
    to,
    "*Tutoriales* — ¿De cuál aplicativo?",
    "Elegir app",
    [
      { id: "1", title: "PREVEBSA", description: "Ver tutoriales de PREVEBSA" },
      { id: "2", title: "ATIPOP", description: "Ver tutoriales de ATIPOP" },
      {
        id: "0",
        title: "Volver al menú principal",
        description: "Regresar al inicio",
      },
      {
        id: "#",
        title: "Contactar con un asesor",
        description: "Hablar con un asesor",
      },
    ],
    "Toque una opción o escriba el número.",
  );
}

async function sendMenuTutorialesPrevebsa(to) {
  return sendInteractiveList(
    to,
    "*Tutoriales PREVEBSA:*",
    "Seleccionar tutorial",
    [
      {
        id: "1",
        title: "Login en PREVEBSA",
        description: "Ingreso y recuperación de contraseña",
      },
      {
        id: "2",
        title: "Plan Diario en PREVEBSA",
        description: "Cómo usar el plan diario",
      },
      {
        id: "3",
        title: "Inspecciones en PREVEBSA",
        description: "Crear inspecciones planeadas",
      },
      {
        id: "4",
        title: "Cómo borrar caché",
        description: "Eliminar datos y caché",
      },
      {
        id: "5",
        title: "Cambiar contraseña",
        description: "Recuperar o cambiar acceso",
      },
      { id: "0", title: "Volver", description: "Regresar al menú anterior" },
      {
        id: "#",
        title: "Contactar con un asesor",
        description: "Hablar con un asesor",
      },
    ],
    "Toque una opción o escriba el número.",
  );
}

async function sendMenuTutorialesAtipop(to) {
  return sendInteractiveList(
    to,
    "*Tutoriales ATIPOP:*",
    "Seleccionar tutorial",
    [
      {
        id: "1",
        title: "Inicio de sesión con FaceID",
        description: "Tutorial de FaceID",
      },
      {
        id: "2",
        title: "Registro de asistencia",
        description: "Cómo registrar asistencia",
      },
      {
        id: "3",
        title: "Cómo registrar FaceID",
        description: "Registrar FaceID paso a paso",
      },
      {
        id: "4",
        title: "Login con correo y contraseña",
        description: "Ingresar con SGA",
      },
      {
        id: "5",
        title: "Cómo borrar caché",
        description: "Eliminar datos y caché",
      },
      {
        id: "6",
        title: "Recuperar contraseña ATIPOP",
        description: "Recuperar acceso",
      },
      { id: "0", title: "Volver", description: "Regresar al menú anterior" },
      {
        id: "#",
        title: "Contactar con un asesor",
        description: "Hablar con un asesor",
      },
    ],
    "Toque una opción o escriba el número.",
  );
}

async function sendMenuTipoProblema(to) {
  return sendInteractiveList(
    to,
    "¿Qué tipo de problema desea solucionar?\n\nPor favor seleccione una respuesta",
    "Tipo de problema",
    [
      {
        id: "error",
        title: "Un error",
        description: "Un problema con el aplicativo por un error del mismo",
      },
      {
        id: "peticion",
        title: "Una petición",
        description: "Necesito cambiar el municipio o reabrir el plan diario",
      },
    ],
    "Toque una opción o escriba el número.",
  );
}

module.exports = {
  sendMenuPrincipal,
  sendMenuPrevebsa,
  sendMenuAtipop,
  sendMenuTutoriales: sendMenuTutoriales,
  sendMenuTutorialesPrevebsa,
  sendMenuTutorialesAtipop,
  sendMenuTipoProblema,
};

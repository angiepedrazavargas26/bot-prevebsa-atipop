require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// ============================================================
// AGENTES
// ============================================================
const AGENTES = ['573102614279', '573212135099'];
const modoHumano = new Set();
const agenteActivo = new Map();
const sessions = {};

// ============================================================
// KNOWLEDGE BASE — Errores conocidos con solución exacta
// ============================================================
const knowledgeBase = [

  // ── PREVEBSA ─────────────────────────────────────────────

  {
    id: "P1", app: "PREVEBSA", modulo: "Plan Diario",
    keywords: ["plan anterior", "plan de ayer", "plan viejo", "aparece el plan de ayer", "datos del dia anterior", "cache plan", "plan diario de ayer"],
    respuesta: "Buenos días. El inconveniente que presenta se debe a que la aplicación quedó con datos en caché del día anterior.\n\nPara solucionarlo, por favor siga estos pasos:\n\n1️⃣ Vaya a *Ajustes del teléfono → Aplicaciones → PREVEBSA → Almacenamiento*\n2️⃣ Toque *Borrar caché*\n3️⃣ Reinicie la aplicación e ingrese nuevamente\n\n💡 *Recomendación:* Cierre sesión al finalizar cada jornada para evitar que esto vuelva a ocurrir.\n\n¿Ya le aparece el plan del día de hoy?"
  },
  {
    id: "P2", app: "PREVEBSA", modulo: "Plan Diario",
    keywords: ["no guarda", "no quedan guardados", "no se guarda", "se pierden los cambios", "perdi los cambios", "no guardo al autorizar"],
    respuesta: "Entendido. Ese inconveniente puede deberse a un problema de sincronización o caché. Por favor siga estos pasos:\n\n1️⃣ Cierre sesión y vuelva a ingresar para descartar problemas de carga\n2️⃣ Si el problema persiste, vaya a *Ajustes → Aplicaciones → PREVEBSA → Almacenamiento → Borrar caché*\n3️⃣ Antes de enviar a autorización, verifique que tenga buena conexión a internet\n\n💡 *Recomendación:* Si se encuentra en zona con señal débil, active el *Modo Offline* desde Configuración y sincronice cuando tenga buena conectividad.\n\n¿Pudo guardar los cambios correctamente?"
  },
  {
    id: "P3", app: "PREVEBSA", modulo: "Planificaciones",
    keywords: ["cerro la planificacion", "se cerro la planificacion", "ya se envio y falta", "necesito reabrir planificacion", "reabrir planificacion", "modificar planificacion enviada"],
    respuesta: "Entendido. Cuando una planificación ya fue enviada o finalizada, no es posible editarla directamente desde la app móvil.\n\nPara reabrirla debe:\n\n1️⃣ Comunicarse con el *administrador del sistema* indicando:\n   - Su nombre completo\n   - La razón del cambio solicitado\n2️⃣ El administrador reabrirá la planificación desde el módulo web *'Observar Planificaciones'*\n3️⃣ Una vez reabierta, podrá editarla nuevamente desde la app\n\n💡 *Recomendación:* Antes de enviar a autorización, revise que estén completos: gráficos, inspecciones, preguntas preliminares, actividades, trabajadores y firmas.\n\n¿Necesita algo más?"
  },
  {
    id: "P4", app: "PREVEBSA", modulo: "Inspecciones",
    keywords: ["cerro la inspeccion", "se cerro la inspeccion", "reabrir inspeccion", "modificar inspeccion completada", "inspeccion ya completada"],
    respuesta: "Entendido. Una vez completada, la inspección no puede editarse directamente desde la app.\n\nPara reabrirla:\n\n1️⃣ Comuníquese con el *administrador del sistema* indicando:\n   - Nombre del inspector\n   - Razón del cambio\n2️⃣ El administrador la reabrirá desde el módulo web *'Observar Inspecciones'*\n\n💡 *Recomendación:* Antes de completar una inspección, verifique que estén llenos todos los módulos: documentos del vehículo, estado, evidencias y comentarios.\n\n¿Necesita algo más?"
  },
  {
    id: "P5", app: "PREVEBSA", modulo: "Conectividad",
    keywords: ["lenta", "no carga prevebsa", "sin señal", "mala señal", "no funciona sin internet", "modo offline prevebsa"],
    respuesta: "Ese inconveniente es común en zonas con señal débil. Por favor siga estos pasos:\n\n1️⃣ Vaya a *Configuración* dentro de la app\n2️⃣ Active el *Modo Offline*\n3️⃣ Trabaje con normalidad — la información se guardará localmente\n4️⃣ Cuando tenga buena señal, cambie a *Modo Online* para sincronizar los cambios\n\n💡 *Recomendación:* Antes de salir a campo, asegúrese de que toda la información base esté cargada en modo offline.\n\n¿Le funcionó correctamente?"
  },
  {
    id: "P6", app: "PREVEBSA", modulo: "Acceso",
    keywords: ["olvide contrasena prevebsa", "no recuerdo clave prevebsa", "recuperar contrasena prevebsa", "no puedo entrar prevebsa", "login prevebsa", "contrasena prevebsa", "usuario prevebsa inactivo"],
    respuesta: "Con gusto le ayudo. Para recuperar el acceso a PREVEBSA:\n\n*Si olvidó la contraseña:*\n1️⃣ En la pantalla de inicio, toque *'Recuperar Contraseña'*\n2️⃣ Ingrese su correo electrónico registrado\n3️⃣ Revise su bandeja de entrada (y la carpeta de spam)\n4️⃣ Siga el enlace para crear una nueva contraseña\n\n*Si el correo no llega:*\n→ Verifique que el correo esté bien escrito\n→ Si el problema persiste, contacte al administrador de su empresa\n\n*Si aparece como usuario inactivo:*\n→ El administrador de su empresa debe reactivar su cuenta\n\n¿Cuál de estos casos aplica a su situación?"
  },
  {
    id: "P7", app: "PREVEBSA", modulo: "Imágenes",
    keywords: ["no suben imagenes prevebsa", "imagenes no se guardan", "fotos no quedan", "no guarda fotos prevebsa", "actualizar imagenes"],
    respuesta: "Ese inconveniente tiene solución. Por favor siga estos pasos:\n\n1️⃣ Después de seleccionar las imágenes, asegúrese de tocar el botón *'Actualizar imágenes'* — este paso es obligatorio\n2️⃣ Verifique que el dispositivo tenga espacio de almacenamiento disponible\n3️⃣ Si el problema persiste, borre el caché de la app y vuelva a intentarlo\n\n⚠️ *Importante:* Las imágenes no quedan guardadas si no se presiona *'Actualizar imágenes'* después de agregarlas.\n\n¿Quedaron guardadas correctamente?"
  },
  {
    id: "P8", app: "PREVEBSA", modulo: "Notificaciones",
    keywords: ["no llegan notificaciones prevebsa", "notificaciones desactualizadas prevebsa", "segundo plano prevebsa", "no recibo notificaciones"],
    respuesta: "Para solucionar el inconveniente con las notificaciones:\n\n1️⃣ Ingrese al módulo de *Notificaciones* y toque el botón *Actualizar*\n2️⃣ Vaya a *Configuración* dentro de la app y active el *'Segundo Plano'*\n3️⃣ En los *Ajustes del teléfono*, verifique que las notificaciones de PREVEBSA estén habilitadas\n\n💡 Mantener el *'Segundo Plano'* activado permite recibir notificaciones en tiempo real.\n\n¿Las notificaciones llegaron correctamente?"
  },
  {
    id: "P9", app: "PREVEBSA", modulo: "Plan Diario",
    keywords: ["no aparece la inspeccion", "inspeccion no aparece en plan", "no puedo asignar inspeccion", "inspeccion no sale en plan diario"],
    respuesta: "Ese inconveniente ocurre cuando la inspección no ha sido completada. Por favor verifique:\n\n1️⃣ Ingrese al módulo de *Inspecciones*\n2️⃣ Busque la inspección correspondiente y verifique que esté en estado *'Completada'*\n3️⃣ Si aparece en estado *'Creada'*, debe finalizarla antes de asignarla al plan\n4️⃣ Si ya está completada pero no aparece, cierre sesión, borre el caché y vuelva a ingresar\n\n💡 La inspección solo está disponible para asignar al plan diario cuando su estado es *'Completada'*.\n\n¿Pudo asignarla al plan?"
  },
  {
    id: "P10", app: "PREVEBSA", modulo: "Firmas",
    keywords: ["no puedo firmar", "firma no se guarda", "no deja firmar", "firmas trabajadores", "problema con firmas"],
    respuesta: "El inconveniente con las firmas generalmente se debe a conectividad. Por favor:\n\n1️⃣ Verifique la conexión a internet o active el *Modo Offline* desde Configuración\n2️⃣ Cierre y vuelva a abrir el formulario de asignación de trabajadores\n3️⃣ Si el problema persiste, borre el caché de la app e intente nuevamente\n\n💡 *Recomendación:* Recolecte todas las firmas antes de enviar la planificación a autorización.\n\n¿Pudo registrar las firmas correctamente?"
  },
  {
    id: "P_PLAN_COMO", app: "PREVEBSA", modulo: "Planificaciones",
    keywords: ["como crear una planificacion", "como hago una planificacion", "como hago el plan diario", "paso a paso planificacion", "como se hace la planificacion"],
    respuesta: "Con gusto le explico cómo crear una planificación en PREVEBSA.\n\nExisten *2 formatos* según el tipo de trabajo:\n⚡ *Con Energía* — actividades con corriente activa\n🔌 *Sin Energía* — actividades sin corriente\n\n*Datos iniciales:*\n→ Persona que autoriza, zona del trabajador, zona de destino\n→ Municipio, departamento y ubicación en Google Maps\n→ Ruta y actividad principal\n\n*Gráficos (opcional):*\n→ Puede subir el unifilar y el rutograma\n\n*Inspección:*\n→ Asigne la inspección preoperacional previamente completada\n\n*Preguntas preliminares:*\n→ Complete las preguntas configuradas para esa actividad\n\n*Actividades:*\n→ Seleccione proceso y actividad → agregue pasos, riesgos ⚠️ y barreras 🛡️\n\n*Trabajadores:*\n→ Asigne cada trabajador con su función, firma y orden de trabajo si aplica\n\n*Envío:*\n→ Toque *'Enviar a Autorización'* → el coordinador recibirá notificación para aprobar ✅\n\nEstados: 🟡 Creada → 🟠 En espera → 🟢 Autorizada → ✅ Finalizada → 📊 Revisada HSEQ\n\n¿En qué parte del proceso tiene alguna dificultad?"
  },
  {
    id: "P_INS_COMO", app: "PREVEBSA", modulo: "Inspecciones",
    keywords: ["como hacer una inspeccion prevebsa", "paso a paso inspeccion prevebsa", "como se hace la inspeccion", "como crear inspeccion prevebsa"],
    respuesta: "Con gusto le explico cómo realizar una inspección preoperacional en PREVEBSA.\n\nExisten *3 formatos* disponibles:\n🚗 *Vehículo* | 🏍️ *Moto* | 🔧 *Equipos Críticos*\n\n*Para Vehículo y Moto:*\n1️⃣ Seleccione el formato e ingrese el área a la que pertenece\n2️⃣ Ingrese la placa del vehículo o moto\n3️⃣ Verifique los inspectores (aparece su nombre automáticamente) y agregue más si es necesario\n4️⃣ Firme la inspección\n5️⃣ Complete los módulos: *Documentos del vehículo* y *Estado del vehículo*\n6️⃣ Responda las preguntas y agregue las evidencias fotográficas 📸\n7️⃣ Agregue comentarios si aplica\n8️⃣ Toque *'Completar'* para finalizarla y que quede disponible para el plan diario\n\n*Para Equipos Críticos:*\n→ Los módulos varían según las herramientas seleccionadas\n→ Cada herramienta tiene su propio módulo de inspección\n\n⚠️ La inspección debe estar en estado *'Completada'* para poder asignarla al plan diario.\n\n¿Tiene alguna dificultad en alguno de estos pasos?"
  },

  // ── ATIPOP ────────────────────────────────────────────────

  {
    id: "A1", app: "ATIPOP", modulo: "FaceID",
    keywords: ["faceid", "face id", "atiface", "no reconoce la cara", "no me deja entrar con cara", "biometrico", "registrar cara", "foto no reconoce"],
    respuesta: "El inconveniente con FaceID tiene solución. Por favor siga estos pasos:\n\n1️⃣ Ingrese a *Mi Cuenta → ATIFace*\n2️⃣ Verifique si su fotografía está registrada\n3️⃣ Si no está registrada, tome una nueva foto con *buena iluminación* y *fondo neutro*\n4️⃣ Si ya estaba registrada pero sigue fallando, elimine el registro y vuelva a realizarlo\n\n💡 El registro biométrico debe hacerse en condiciones adecuadas de luz para mayor precisión.\n\n¿Pudo ingresar correctamente?"
  },
  {
    id: "A_LOGIN_CREDENCIALES", app: "ATIPOP", modulo: "Login",
    keywords: ["no puedo entrar atipop", "no puedo iniciar sesion atipop", "login atipop", "correo y contrasena atipop", "credenciales atipop", "no me deja entrar atipop", "usuario atipop", "contrasena atipop"],
    respuesta: "Con gusto le ayudo. El inicio de sesión en ATIPOP utiliza las credenciales del sistema *SGA*.\n\nPor favor verifique:\n\n1️⃣ Ingrese el *correo electrónico* y *contraseña* que usa en el sistema SGA\n2️⃣ Asegúrese de no tener espacios adicionales al escribir los datos\n3️⃣ La contraseña distingue entre mayúsculas y minúsculas\n\n*Si olvidó la contraseña:*\n→ En la pantalla de inicio toque *'Recuperar Contraseña'*\n→ Ingrese su correo registrado y revise su bandeja de entrada\n→ Si el correo no funciona, contacte a *Talento Humano*\n\n*Si aparece error de credenciales inválidas:*\n→ Verifique que su usuario esté activo en el sistema SGA\n→ Contacte al administrador si el problema persiste\n\n¿Cuál es el mensaje de error exacto que le aparece en pantalla?"
  },
  {
    id: "A_LOGIN_FACEID_COMO", app: "ATIPOP", modulo: "Login FaceID",
    keywords: ["como iniciar sesion con faceid", "como entrar con faceid", "como usar faceid atipop", "paso a paso faceid", "como se usa el faceid"],
    respuesta: "Con gusto le explico cómo iniciar sesión con FaceID en ATIPOP.\n\n*Antes de usarlo, debe tener el FaceID registrado:*\n1️⃣ Ingrese a *Mi Cuenta → ATIFace*\n2️⃣ Tome una fotografía con buena iluminación y fondo neutro\n3️⃣ Guarde el registro\n\n*Para iniciar sesión con FaceID:*\n1️⃣ Abra ATIPOP\n2️⃣ En la pantalla de inicio, seleccione la opción *FaceID*\n3️⃣ Posicione su rostro frente a la cámara según las indicaciones\n4️⃣ La app lo reconocerá y le dará acceso automáticamente\n\n⚠️ Si el FaceID no lo reconoce, puede ingresar con correo y contraseña como alternativa.\n\n¿Tiene alguna dificultad con alguno de estos pasos?"
  },
  {
    id: "A2", app: "ATIPOP", modulo: "Formularios",
    keywords: ["formulario sin dato", "formulario bloqueado", "aparece respondido", "datos corruptos", "no puedo editar formulario", "formulario lleno solo"],
    respuesta: "Ese inconveniente se debe a datos corruptos en el caché de la aplicación. Para solucionarlo:\n\n1️⃣ Vaya a *Ajustes del teléfono → Aplicaciones → ATIPOP → Almacenamiento*\n2️⃣ Toque *Borrar Datos* y luego *Borrar Caché*\n3️⃣ Vuelva a iniciar sesión y abra el formulario nuevamente\n\n⚠️ *Importante:* No cierre la app mientras el formulario está cargando, ya que esto puede generar este tipo de error.\n\n¿Quedó disponible el formulario para diligenciar?"
  },
  {
    id: "A3", app: "ATIPOP", modulo: "Sincronización",
    keywords: ["no sincroniza atipop", "sincronizacion atipop", "datos viejos atipop", "informacion desactualizada atipop", "no carga informacion atipop"],
    respuesta: "Entendido. El inconveniente es de sincronización. Por favor siga estos pasos:\n\n1️⃣ Abra el *menú lateral* ☰ y toque el botón *'Sincronizar'*\n2️⃣ Asegúrese de tener conexión a internet estable durante el proceso\n3️⃣ Espere a que la sincronización finalice completamente\n4️⃣ Si no carga, cierre sesión, vuelva a ingresar y sincronice nuevamente\n\n💡 *Recomendación:* Sincronice al inicio de cada jornada y después de recibir cambios en el sistema.\n\n¿Ya cargó la información actualizada?"
  },
  {
    id: "A4", app: "ATIPOP", modulo: "Recibos",
    keywords: ["recibos atipop", "recibo nomina", "desprendible", "no carga recibos", "tarda recibos", "modulo recibos lento"],
    respuesta: "El módulo de Recibos presenta demoras en la carga — es un inconveniente conocido que está siendo trabajado por el equipo técnico.\n\nMientras tanto, por favor intente:\n\n1️⃣ Espere al menos *30 segundos* antes de intentar nuevamente\n2️⃣ Conéctese a una red *WiFi estable* para mejores resultados\n3️⃣ Cierre completamente la app y vuelva a abrirla\n\n¿Pudo cargar los recibos?"
  },
  {
    id: "A5", app: "ATIPOP", modulo: "Avisos",
    keywords: ["ver todos avisos", "boton avisos no funciona", "avisos se cierra", "ver todos no funciona"],
    respuesta: "El botón *'Ver todos'* en la sección de Avisos presenta un error conocido que está siendo corregido por el equipo técnico.\n\nMientras se soluciona:\n\n1️⃣ Ingrese al módulo de *Avisos* directamente desde el menú principal\n2️⃣ Evite presionar *'Ver todos'* repetidamente para prevenir que la app se cierre\n\nEl inconveniente ya fue reportado al equipo de desarrollo. ¿Pudo ver sus avisos desde el menú principal?"
  },
  {
    id: "A6", app: "ATIPOP", modulo: "Certificaciones",
    keywords: ["certificacion no llega", "no se envia certificacion", "correo certificacion", "envio certificacion falla"],
    respuesta: "El envío automático de certificaciones por correo presenta fallas conocidas actualmente.\n\nComo solución temporal:\n\n1️⃣ Descargue la certificación *manualmente* desde el módulo correspondiente\n2️⃣ Adjunte el archivo y envíelo por correo de forma manual\n\nEste inconveniente ya fue reportado al equipo técnico para su corrección. ¿Pudo descargarla manualmente?"
  },
  {
    id: "A7", app: "ATIPOP", modulo: "GPS",
    keywords: ["no llegan alertas gps", "alerta riesgo no llega", "gps atipop", "no vibra alerta", "emergencia no notifica", "alertas gps configurar"],
    respuesta: "Las alertas de riesgos y emergencias dependen de la configuración del GPS. Por favor verifique:\n\n1️⃣ Ingrese a *Configuración* en ATIPOP y ajuste la *distancia de alertas GPS*\n2️⃣ Active las *alertas por vibración* en la misma sección\n3️⃣ En los *Ajustes del teléfono*, verifique que ATIPOP tenga permisos de *Ubicación* habilitados\n\n💡 *Recomendación:* Configure las alertas GPS al inicio de cada turno.\n\n¿Quedaron activadas las alertas?"
  },
  {
    id: "A_REPORTE_RUTA", app: "ATIPOP", modulo: "Reporte en Ruta",
    keywords: ["reporte en ruta", "como hacer reporte", "reporte diario atipop", "crear reporte atipop", "reporte ruta atipop"],
    respuesta: "Con gusto le explico cómo realizar un Reporte en Ruta en ATIPOP.\n\n*Requisito previo:* Tener el GPS activo en su teléfono.\n\n1️⃣ En los *Ajustes del teléfono*, active la *Ubicación* y permita el acceso a ATIPOP\n2️⃣ Ingrese al módulo *'Reporte en Ruta'* desde la pantalla principal\n3️⃣ Seleccione la ruta o subestación asignada\n4️⃣ Complete los datos del reporte según corresponda\n5️⃣ Toque *'Guardar'*\n6️⃣ Sincronice cuando tenga señal estable\n\n¿Tiene alguna dificultad en alguno de estos pasos?"
  },
  {
    id: "A_SUPERVISION", app: "ATIPOP", modulo: "Supervisiones",
    keywords: ["supervision atipop", "supervisiones atipop", "como hacer una supervision", "modulo supervision", "paso a paso supervision"],
    respuesta: "Con gusto le oriento. En ATIPOP, las Supervisiones e Inspecciones están disponibles desde la pantalla principal.\n\nPara acceder:\n1️⃣ Desde la pantalla principal, busque la sección *'Supervisiones e Inspecciones'*\n2️⃣ Seleccione el formato correspondiente según el tipo de supervisión\n3️⃣ Complete los datos requeridos: subestación, tipo de inspección y trabajador asignado\n4️⃣ Diligencie el formulario con la información del momento\n5️⃣ Toque *'Guardar'* y luego *'Sincronizar'*\n\n⚠️ Si no encuentra la opción de Supervisiones, verifique que su usuario tenga el rol y permisos necesarios — puede consultar con el administrador de su empresa.\n\n¿Tiene alguna dificultad específica con este módulo?"
  },
  {
    id: "A_INSPECCION_ATIPOP", app: "ATIPOP", modulo: "Inspecciones",
    keywords: ["inspeccion atipop", "como hacer inspeccion atipop", "paso a paso inspeccion atipop", "crear inspeccion atipop", "nueva inspeccion atipop"],
    respuesta: "Con gusto le explico cómo realizar una inspección en ATIPOP.\n\n1️⃣ Abra ATIPOP y vaya al menú principal\n2️⃣ Ingrese a *'Supervisiones e Inspecciones'*\n3️⃣ Toque *'Nueva Inspección'* (botón + o 'Nueva')\n4️⃣ Complete los datos:\n   → Seleccione la subestación\n   → Elija el tipo de inspección\n   → Asigne el trabajador responsable\n5️⃣ Diligencie el formulario con la información del momento\n6️⃣ Toque *'Guardar'* y luego *'Sincronizar'* para enviarla\n\n💡 Si hay campos que no sabe cómo completar, puede dejarlos en blanco por ahora o consultar con alguien que ya lo haya hecho.\n\n¿Tiene alguna dificultad en alguno de estos pasos?"
  },
  {
    id: "A_LECTURAS", app: "ATIPOP", modulo: "Lecturas",
    keywords: ["lecturas atipop", "como hacer una lectura", "registro lecturas", "lectura medidor", "lectura equipo", "nueva lectura atipop"],
    respuesta: "Con gusto le explico cómo registrar lecturas en ATIPOP.\n\nEn el módulo de *Lecturas* puede registrar:\n📊 Lectura de medidores (voltaje, corriente, etc.)\n🏷️ Lectura de códigos QR o etiquetas\n🔧 Lectura de equipos o activos\n\n*Pasos para registrar una lectura:*\n1️⃣ Ingrese a *ATIPOP → Lecturas* (o 'Mediciones')\n2️⃣ Toque *'Nueva Lectura'* (botón + o 'Nueva')\n3️⃣ Seleccione la subestación\n4️⃣ Elija el medidor o equipo a revisar\n5️⃣ Ingrese los valores: voltaje, corriente, frecuencia (según aplique)\n6️⃣ Tome la foto del medidor si se requiere 📸\n7️⃣ Toque *'Guardar'* y luego *'Sincronizar'*\n\n💡 La app le avisará si algún valor está fuera del rango esperado.\n\n¿En qué paso tiene dificultad?"
  },
  {
    id: "A_LECTURAS_PROBLEMA", app: "ATIPOP", modulo: "Lecturas",
    keywords: ["no sube lectura", "lectura no se guarda", "error en lecturas", "no puedo registrar lectura", "lectura falla", "no me deja subir foto lectura"],
    respuesta: "Entendido. Para resolver el inconveniente con las lecturas:\n\n1️⃣ Verifique que tiene conexión a internet o active el *Modo Offline* si no tiene señal\n2️⃣ Asegúrese de completar todos los campos obligatorios antes de guardar\n3️⃣ Si la foto no sube, verifique que ATIPOP tenga permisos de *Cámara* en Ajustes del teléfono\n4️⃣ Si el error persiste, cierre la app, borre el caché y vuelva a intentarlo\n\n¿Qué mensaje de error exacto le aparece en pantalla?"
  }
];

// ============================================================
// HELPERS
// ============================================================

function getSession(phone) {
  if (!sessions[phone]) {
    sessions[phone] = { history: [], attempts: 0, primerMensaje: true, nombre: null, contexto: null };
  }
  return sessions[phone];
}

function searchKnowledge(text) {
  const lower = text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar tildes para mejor matching
  for (const entry of knowledgeBase) {
    for (const keyword of entry.keywords) {
      const kw = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lower.includes(kw)) return entry;
    }
  }
  return null;
}

async function sendWhatsApp(to, message) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } })
    }
  );
  return response.json();
}

async function notificarAgentes(phone, texto) {
  const alerta = `🔔 *NUEVO CASO DE SOPORTE*\n\n👤 Usuario: +${phone}\n💬 Mensaje: "${texto}"\n\nPara atender escriba:\n▶️ *#agente ${phone}*\n\n_(Luego escriba normalmente — sus mensajes llegarán directo al usuario)_\n\nPara terminar:\n⏹️ *#bot*`;
  for (const agente of AGENTES) {
    try { await sendWhatsApp(agente, alerta); }
    catch (e) { console.error(`Error notificando agente ${agente}:`, e.message); }
  }
}

async function askClaude(userMessage, history, nombre, contexto) {
  const systemPrompt = `Usted es el asistente virtual de soporte técnico de ATI (Asistencia Técnica Industrial).
Apoya a los usuarios con los aplicativos ATIPOP y PREVEBSA.

TONO Y ESTILO:
- Formal y cordial, como un asesor de soporte profesional
- Cercano pero respetuoso — use "usted" o "le" según el contexto
- Empático ante problemas: reconozca el inconveniente antes de dar la solución
- Claro y directo — sin rodeos innecesarios
- Use emojis moderadamente solo para resaltar pasos importantes
${nombre ? `- El nombre del usuario es ${nombre}` : ''}

REGLAS IMPORTANTES:
- Responda SIEMPRE en español
- Si el usuario describe un problema, PRIMERO pregunte qué error exacto le aparece antes de asumir la causa
- NUNCA cambie de módulo ni de aplicativo sin que el usuario lo indique explícitamente
- Si el contexto dice que estamos en PREVEBSA, SOLO hable de PREVEBSA
- Si el contexto dice que estamos en Lecturas, SOLO hable de Lecturas — NO mencione FaceID
- Si el contexto dice que estamos en Inspecciones ATIPOP, SOLO hable de Inspecciones ATIPOP — NO mencione FaceID
- Si el contexto dice que estamos en Supervisiones, SOLO hable de Supervisiones
- FaceID es ÚNICAMENTE del módulo de Login/Mi Cuenta de ATIPOP — NO lo mencione en otros módulos
- Al final de cada respuesta, haga UNA sola pregunta de verificación
- Si no conoce la respuesta con certeza, indíquelo con honestidad y ofrezca escalar con un asesor

CONTEXTO DE LOS APLICATIVOS:
${contexto || ''}

ATIPOP — Gestión de subestaciones eléctricas (media y alta tensión):
- Login: con correo/contraseña del sistema SGA, o con FaceID (registrado en Mi Cuenta → ATIFace)
- Mi Cuenta: carnet QR, documentación personal, ATIFace (registro biométrico), Mi Vehículo
- Menú lateral: Sincronizar, Configuración (GPS, vibración, segundo plano), Salir
- Pantalla principal: riesgos cercanos, emergencias, avisos, pendientes
- Módulos: Reporte en Ruta, Supervisiones e Inspecciones, Lecturas, Equipos, Otros
- Errores conocidos: botón "Ver todos" en Avisos, lentitud en Recibos, envío automático de certificaciones

PREVEBSA — Seguridad y salud en el trabajo (HSE):
- Login: con correo y contraseña registrados en el sistema
- Módulos móviles: Planificaciones (2 formatos: Con Energía / Sin Energía), Inspecciones Preoperacionales (3 formatos: Vehículo, Moto, Equipos Críticos), Observaciones, Planes de Acción, Módulo Proceso, Configuración, Notificaciones, Mi Cuenta, Carnet
- Planificación: datos iniciales → gráficos → inspección → preguntas preliminares → actividades (proceso/pasos/riesgos/barreras) → trabajadores y firmas → enviar a autorización
- Estados planificación: Creada → En espera → Autorizada → Finalizada → Revisada HSEQ
- Inspección debe estar en estado "Completada" para asignarla al plan diario
- Para reabrir planificaciones o inspecciones ya finalizadas: debe hacerlo el administrador desde el módulo web`;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: systemPrompt,
      messages
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.content[0].text;
}

// ============================================================
// MENÚS
// ============================================================

const MENU_PRINCIPAL = `👋 Bienvenido al soporte técnico de *ATI* 🛠️

Soy su asistente virtual y estoy aquí para ayudarle.
¿Con cuál aplicativo necesita ayuda?

1️⃣ *PREVEBSA* — App de seguridad y salud en el trabajo
2️⃣ *ATIPOP* — App de operación de subestaciones eléctricas
3️⃣ 📹 *TUTORIALES* — Ver videos de uso
0️⃣ 🙋 *ASESOR* — Hablar con un asesor humano

_Responda con el número de su opción_ 👇`;

const MENU_PREVEBSA = `📱 *PREVEBSA* — ¿En qué le puedo ayudar?

1️⃣ 🔐 Login o recuperar contraseña
2️⃣ 📋 Planificaciones (Plan Diario)
3️⃣ 🔍 Inspecciones preoperacionales
4️⃣ 👁️ Observaciones
5️⃣ ⚠️ Planes de Acción
6️⃣ 📊 Módulo Proceso
7️⃣ ⚙️ Configuración / Notificaciones
8️⃣ ❓ Otro problema
0️⃣ 🙋 Hablar con un asesor

_Indíqueme el número y cuénteme qué ocurrió_ 👇`;

const MENU_ATIPOP = `📱 *ATIPOP* — ¿En qué le puedo ayudar?

1️⃣ 🔐 Inicio de sesión (correo/contraseña o FaceID)
2️⃣ 👤 Mi Cuenta o Documentos
3️⃣ 🗺️ Reporte en Ruta
4️⃣ 🔍 Supervisiones e Inspecciones
5️⃣ 📊 Lecturas o Equipos
6️⃣ 🔄 Sincronización
7️⃣ ⚙️ Configuración / GPS / Alertas
8️⃣ ❓ Otro problema
0️⃣ 🙋 Hablar con un asesor

_Indíqueme el número y cuénteme qué ocurrió_ 👇`;

const MENSAJE_AGENTE = `Disculpe los inconvenientes presentados.

Un asesor de ATI le responderá en breve desde este mismo número. ⏳

Si desea, puede compartir más detalles del error o una captura de pantalla 📸 — esto le ayudará al asesor a resolver su caso más rápidamente.

Gracias por su paciencia. 🤝`;

const MENU_TUTORIALES = `📹 *Tutoriales disponibles:*

1️⃣ 🔐 Login en PREVEBSA
2️⃣ 📋 Plan Diario en PREVEBSA
3️⃣ 🔍 Inspecciones en PREVEBSA
4️⃣ 😃 Login con FaceID en ATIPOP
5️⃣ 🔑 Login con credenciales en ATIPOP
6️⃣ 🗑️ Cómo borrar caché
7️⃣ 🔒 Recuperar contraseña ATIPOP
0️⃣ 🔙 Volver al menú principal

_Responda con el número del tutorial_ 👇`;

const VIDEOS = {
  '1': { url: 'https://drive.google.com/uc?export=download&id=1xiZ9qBOp7W8zb9sEfs-3U9v-1aLHUsYQ', titulo: '📹 Login en PREVEBSA' },
  '2': { url: 'https://drive.google.com/uc?export=download&id=1r3XjnUIWM8T8lEXptBJKMUmZ09SF8SJ4', titulo: '📹 Plan Diario en PREVEBSA' },
  '3': { url: 'https://drive.google.com/uc?export=download&id=1d23W40kT64R4zJ01qgYTDlAOfudVA9JB', titulo: '📹 Inspecciones en PREVEBSA' },
  '4': { url: 'https://drive.google.com/uc?export=download&id=1wEwGs7Mc8h9gSO22kRy6itN27YiQIq5O', titulo: '📹 FaceID en ATIPOP' },
  '5': { url: 'https://drive.google.com/uc?export=download&id=115kK2LCCS43mfD2S9wWJ266zmzdl_LvZ', titulo: '📹 Login con credenciales en ATIPOP' },
  '6': { url: 'https://drive.google.com/uc?export=download&id=1K-F66G0Mu4vHzF9-vrt42QnUoGUrEDLR', titulo: '📹 Cómo borrar caché' },
  '7': { url: 'https://drive.google.com/uc?export=download&id=1-tVGXmw_NqvBqTgX7Wkc0nMURgLXSOrh', titulo: '📹 Recuperar contraseña ATIPOP' }
};

// Contexto por submenú para pasarle a Claude
const CONTEXTOS = {
  'prevebsa_1': 'El usuario tiene problemas con Login o recuperación de contraseña en PREVEBSA.',
  'prevebsa_2': 'El usuario tiene problemas con Planificaciones (Plan Diario) en PREVEBSA. Hay 2 formatos: Con Energía y Sin Energía. No hay 4 tipos diferentes.',
  'prevebsa_3': 'El usuario tiene problemas con Inspecciones Preoperacionales en PREVEBSA. Hay 3 formatos: Vehículo, Moto y Equipos Críticos.',
  'prevebsa_4': 'El usuario tiene problemas con el módulo de Observaciones en PREVEBSA.',
  'prevebsa_5': 'El usuario tiene problemas con Planes de Acción en PREVEBSA.',
  'prevebsa_6': 'El usuario tiene problemas con el Módulo Proceso en PREVEBSA.',
  'prevebsa_7': 'El usuario tiene problemas con Configuración o Notificaciones en PREVEBSA.',
  'prevebsa_8': 'El usuario tiene un problema con la app PREVEBSA (app de seguridad y salud en el trabajo - HSE). El problema NO encaja en las categorías de login, planificaciones, inspecciones, observaciones, planes de acción, módulo proceso ni configuración. Mantenga el contexto de PREVEBSA en toda la conversación. NO hable de ATIPOP ni de FaceID a menos que el usuario lo mencione explícitamente.',
  'atipop_1': 'El usuario tiene problemas con el inicio de sesión en ATIPOP. Puede ser con correo/contraseña (sistema SGA) o con FaceID (Mi Cuenta → ATIFace). Son dos flujos completamente distintos — preguntar cuál específicamente.',
  'atipop_2': 'El usuario tiene problemas con Mi Cuenta o Documentos en ATIPOP.',
  'atipop_3': 'El usuario tiene problemas con el módulo Reporte en Ruta en ATIPOP.',
  'atipop_4': 'El usuario tiene problemas con Supervisiones e Inspecciones en ATIPOP. Este módulo se accede desde la pantalla principal.',
  'atipop_5': 'El usuario tiene problemas con Lecturas o Equipos en ATIPOP. Lecturas incluye medidores, QR y equipos. NO confundir con FaceID.',
  'atipop_6': 'El usuario tiene problemas con la Sincronización en ATIPOP.',
  'atipop_7': 'El usuario tiene problemas con Configuración, GPS o Alertas en ATIPOP.',
  'atipop_8': 'El usuario tiene un problema con la app ATIPOP (app de gestión de subestaciones eléctricas). El problema NO encaja en las categorías de login, mi cuenta, reporte en ruta, supervisiones, lecturas, sincronización ni configuración. Mantenga el contexto de ATIPOP en toda la conversación. NO hable de PREVEBSA a menos que el usuario lo mencione explícitamente.'
};

async function enviarVideo(to, key) {
  const video = VIDEOS[key];
  if (!video) return;
  try {
    await fetch(`https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'video', video: { link: video.url, caption: video.titulo } })
    });
  } catch {
    await sendWhatsApp(to, `${video.titulo}\n\n🔗 Ver: https://drive.google.com/file/d/${video.url.split('id=')[1]}/view`);
  }
}

// ============================================================
// WEBHOOK
// ============================================================

app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) res.status(200).send(challenge);
  else res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const entry = req.body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];
    if (!message || message.type !== 'text') return;

    const phone = message.from;
    const text = message.text.body.trim();
    console.log(`📩 De ${phone}: ${text}`);

    // ── Comandos de agentes ───────────────────────────────────
    if (AGENTES.includes(phone)) {
      if (text.startsWith('#agente ')) {
        const cliente = text.split('#agente ')[1].trim();
        modoHumano.add(cliente);
        agenteActivo.set(phone, cliente);
        await sendWhatsApp(phone, `✅ *Modo asesor activado* para +${cliente}\n\nEscriba normalmente — sus mensajes llegarán directamente al usuario.\n\nCuando finalice escriba: *#bot*`);
        await sendWhatsApp(cliente, '👨‍💻 Un asesor de ATI ya está disponible para atenderle. ¿En qué le puedo ayudar?');
        return;
      }
      if (text === '#bot') {
        const cliente = agenteActivo.get(phone);
        if (cliente) {
          modoHumano.delete(cliente);
          agenteActivo.delete(phone);
          const s = getSession(cliente);
          s.attempts = 0;
          await sendWhatsApp(phone, `✅ Caso finalizado. Bot reactivado para +${cliente}`);
          await sendWhatsApp(cliente, '🤖 El asistente virtual está nuevamente disponible.\n\nEscriba *menu* si necesita más ayuda. 😊');
        } else {
          await sendWhatsApp(phone, '⚠️ No tiene ningún caso activo en este momento.');
        }
        return;
      }
      if (agenteActivo.has(phone)) {
        const cliente = agenteActivo.get(phone);
        await sendWhatsApp(cliente, `👨‍💻 *Asesor ATI:*\n${text}`);
        return;
      }
    }

    // ── Cliente en modo humano ────────────────────────────────
    if (modoHumano.has(phone)) {
      let agenteAsignado = null;
      for (const [agente, cliente] of agenteActivo.entries()) {
        if (cliente === phone) { agenteAsignado = agente; break; }
      }
      if (agenteAsignado) {
        await sendWhatsApp(agenteAsignado, `📨 *Usuario +${phone}:*\n"${text}"`);
      } else {
        for (const agente of AGENTES) {
          try { await sendWhatsApp(agente, `📨 *Mensaje de +${phone}:*\n"${text}"\n\nEscriba *#agente ${phone}* para atenderlo`); }
          catch (e) { console.error(e.message); }
        }
      }
      return;
    }

    const session = getSession(phone);

    // ── Primer mensaje ────────────────────────────────────────
    if (session.primerMensaje) {
      session.primerMensaje = false;
      await sendWhatsApp(phone, MENU_PRINCIPAL);
      return;
    }

    // ── Detectar nombre ───────────────────────────────────────
    const matchNombre = text.match(/(?:me llamo|soy|mi nombre es)\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)/i);
    if (matchNombre) session.nombre = matchNombre[1];

    // ── Reiniciar ─────────────────────────────────────────────
    const textLower = text.toLowerCase();
    if (['menu', 'inicio', 'hola', 'start', 'reiniciar'].includes(textLower)) {
      session.attempts = 0;
      session.history = [];
      session.contexto = null;
      session.menu = null;
      await sendWhatsApp(phone, MENU_PRINCIPAL);
      return;
    }

    // ── Solicitud de asesor ───────────────────────────────────
    const palabrasAgente = ['agente', 'humano', 'persona', 'asesor', 'ayuda urgente', 'hablar con alguien'];
    if (palabrasAgente.some(p => textLower.includes(p)) || text === '0') {
      await sendWhatsApp(phone, MENSAJE_AGENTE);
      await notificarAgentes(phone, text);
      modoHumano.add(phone);
      return;
    }

    // ── Navegación menú principal ─────────────────────────────
    if (!session.menu || session.menu === 'principal') {
      if (text === '1' || textLower.includes('prevebsa')) {
        session.menu = 'prevebsa';
        session.contexto = null;
        await sendWhatsApp(phone, MENU_PREVEBSA);
        return;
      }
      if (text === '2' || textLower.includes('atipop')) {
        session.menu = 'atipop';
        session.contexto = null;
        await sendWhatsApp(phone, MENU_ATIPOP);
        return;
      }
      if (text === '3') {
        session.menu = 'tutoriales';
        await sendWhatsApp(phone, MENU_TUTORIALES);
        return;
      }
    }

    // ── Submenú PREVEBSA ──────────────────────────────────────
    if (session.menu === 'prevebsa' && !session.contexto) {
      const opcionesPrevebsa = { '1': 'prevebsa_1', '2': 'prevebsa_2', '3': 'prevebsa_3', '4': 'prevebsa_4', '5': 'prevebsa_5', '6': 'prevebsa_6', '7': 'prevebsa_7', '8': 'prevebsa_8' };
      if (opcionesPrevebsa[text]) {
        session.contexto = opcionesPrevebsa[text];
        const preguntasInicio = {
          'prevebsa_1': '¿Cuál es el inconveniente con el acceso? ¿Olvidó la contraseña, su usuario aparece inactivo, o no puede ingresar con las credenciales?',
          'prevebsa_2': '¿Cuál es el inconveniente con la planificación? Por ejemplo: ¿No puede crearla, se perdieron los datos, necesita reabrirla, o tiene otro problema?',
          'prevebsa_3': '¿Cuál es el inconveniente con las inspecciones? ¿No puede crearla, ya la cerró y necesita reabrirla, o no aparece para asignarla al plan diario?',
          'prevebsa_4': '¿Cuál es el inconveniente con las observaciones? Cuénteme qué ocurrió.',
          'prevebsa_5': '¿Cuál es el inconveniente con los planes de acción? Cuénteme qué ocurrió.',
          'prevebsa_6': '¿Cuál es el inconveniente con el Módulo Proceso? Cuénteme qué ocurrió.',
          'prevebsa_7': '¿Cuál es el inconveniente con la configuración o notificaciones? Cuénteme qué ocurrió.',
          'prevebsa_8': 'Entendido, con gusto le ayudo con PREVEBSA. Por favor cuénteme con detalle qué inconveniente está presentando — entre más detalles me dé, mejor podré orientarle.'
        };
        await sendWhatsApp(phone, preguntasInicio[session.contexto]);
        return;
      }
    }

    // ── Submenú ATIPOP ────────────────────────────────────────
    if (session.menu === 'atipop' && !session.contexto) {
      const opcionesAtipop = { '1': 'atipop_1', '2': 'atipop_2', '3': 'atipop_3', '4': 'atipop_4', '5': 'atipop_5', '6': 'atipop_6', '7': 'atipop_7', '8': 'atipop_8' };
      if (opcionesAtipop[text]) {
        session.contexto = opcionesAtipop[text];
        const preguntasInicio = {
          'atipop_1': '¿El inconveniente es con el inicio de sesión con *correo y contraseña*, o con *FaceID*?',
          'atipop_2': '¿Cuál es el inconveniente con Mi Cuenta o Documentos? Cuénteme qué ocurrió.',
          'atipop_3': '¿Cuál es el inconveniente con el Reporte en Ruta? Cuénteme qué ocurrió.',
          'atipop_4': '¿Cuál es el inconveniente con Supervisiones e Inspecciones? Cuénteme qué ocurrió.',
          'atipop_5': '¿El inconveniente es con *Lecturas* (medidores, equipos) o con *Equipos* (historial, devolutivos)?',
          'atipop_6': '¿Cuál es el inconveniente con la sincronización? ¿No sincroniza, se queda pegada, o muestra información desactualizada?',
          'atipop_7': '¿El inconveniente es con la *configuración general*, las *alertas GPS*, o algo más?',
          'atipop_8': 'Entendido, con gusto le ayudo con ATIPOP. Por favor cuénteme con detalle qué inconveniente está presentando — entre más detalles me dé, mejor podré orientarle.'
        };
        await sendWhatsApp(phone, preguntasInicio[session.contexto]);
        return;
      }
    }

    // ── Tutoriales ────────────────────────────────────────────
    if (session.menu === 'tutoriales') {
      if (text === '0') { session.menu = null; await sendWhatsApp(phone, MENU_PRINCIPAL); return; }
      if (VIDEOS[text]) {
        await sendWhatsApp(phone, '⏳ Enviando tutorial...');
        await enviarVideo(phone, text);
        await sendWhatsApp(phone, '¿Necesita ayuda con algo más? Escriba *menu* para volver al inicio 🏠');
        return;
      }
    }

    // ── Knowledge base ────────────────────────────────────────
    const match = searchKnowledge(text);
    if (match) {
      session.attempts = 0;
      session.history.push({ role: 'user', content: text });
      session.history.push({ role: 'assistant', content: match.respuesta });
      await sendWhatsApp(phone, match.respuesta);
      return;
    }

    // ── Escalada automática por intentos fallidos ─────────────
    const frasesFallo = ['no funciono', 'sigue igual', 'no sirve', 'no pude', 'todavia no', 'aun no', 'sigue el problema', 'no se soluciono'];
    if (frasesFallo.some(f => textLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(f))) {
      session.attempts++;
    }
    if (session.attempts >= 2) {
      await sendWhatsApp(phone, MENSAJE_AGENTE);
      await notificarAgentes(phone, `Problema sin resolver tras varios intentos. Último mensaje: "${text}"`);
      modoHumano.add(phone);
      session.attempts = 0;
      return;
    }

    // ── Claude con contexto del submenú ───────────────────────
    const contextoActual = session.contexto ? CONTEXTOS[session.contexto] : null;
    const reply = await askClaude(text, session.history, session.nombre, contextoActual);
    session.history.push({ role: 'user', content: text });
    session.history.push({ role: 'assistant', content: reply });
    if (session.history.length > 12) session.history = session.history.slice(-12);

    await sendWhatsApp(phone, reply);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
});

app.get('/', (req, res) => res.json({ status: '✅ ATI Bot funcionando', timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ATI Bot corriendo en puerto ${PORT}`));
// bot/knowledge/base.js

const knowledgeBase = [
  {
    id: "P1",
    app: "PREVEBSA",
    modulo: "Plan Diario",
    keywords: [
      "plan anterior",
      "plan de ayer",
      "plan viejo",
      "aparece el plan de ayer",
      "datos del dia anterior",
      "cache plan",
      "plan diario de ayer",
    ],
    respuesta: `El problema se debe a datos en caché del día anterior.\n\n
  1️⃣ *Ajustes del teléfono → Aplicaciones → PREVEBSA → Almacenamiento → Borrar caché*\n
  2️⃣ Reinicie la app e ingrese de nuevo\n
  \n▸ Cierre sesión al finalizar cada jornada para evitarlo.\n
  \n¿Ya aparece el plan de hoy?\n
  \n_Escriba *0* para hablar con un asesor_`,
  },
  {
    id: "P2",
    app: "PREVEBSA",
    modulo: "Plan Diario",
    keywords: [
      "no guarda",
      "no quedan guardados",
      "no se guarda",
      "se pierden los cambios",
      "perdi los cambios",
      "no guardo al autorizar",
    ],
    respuesta:
      "Puede ser sincronización o caché:\n\n1️⃣ Cierre sesión y vuelva a ingresar\n2️⃣ Si persiste: *Ajustes → Aplicaciones → PREVEBSA → Almacenamiento → Borrar caché*\n3️⃣ Verifique buena conexión antes de enviar a autorización\n\n¿Pudo guardar correctamente?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P3",
    app: "PREVEBSA",
    modulo: "Planificaciones",
    keywords: [
      "cerro la planificacion",
      "se cerro la planificacion",
      "ya se envio y falta",
      "necesito reabrir planificacion",
      "reabrir planificacion",
      "modificar planificacion enviada",
    ],
    respuesta:
      "Una planificación enviada no se puede editar desde la app.\n\nDebe contactar al *administrador del sistema* con:\n→ Su nombre completo\n→ La razón del cambio\n\nEl administrador la reabrirá desde el módulo web *'Observar Planificaciones'*.\n\n¿Necesita algo más?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P4",
    app: "PREVEBSA",
    modulo: "Inspecciones",
    keywords: [
      "cerro la inspeccion",
      "se cerro la inspeccion",
      "reabrir inspeccion",
      "modificar inspeccion completada",
      "inspeccion ya completada",
    ],
    respuesta:
      "Una inspección completada no se puede editar desde la app.\n\nContacte al *administrador* con:\n→ Nombre del inspector\n→ Razón del cambio\n\nEl administrador la reabrirá desde *'Observar Inspecciones'* en la web.\n\n¿Necesita algo más?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P5",
    app: "PREVEBSA",
    modulo: "Conectividad",
    keywords: [
      "lenta",
      "no carga prevebsa",
      "sin señal",
      "mala señal",
      "no funciona sin internet",
      "modo offline prevebsa",
    ],
    respuesta:
      "Para trabajar sin señal:\n\n1️⃣ *Configuración* en la app → active *Modo Offline*\n2️⃣ Trabaje normalmente\n3️⃣ Al tener señal, cambie a *Modo Online* para sincronizar\n\n¿Le funcionó?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P6",
    app: "PREVEBSA",
    modulo: "Acceso",
    keywords: [
      "olvide contrasena prevebsa",
      "no recuerdo clave prevebsa",
      "recuperar contrasena prevebsa",
      "no puedo entrar prevebsa",
      "login prevebsa",
      "contrasena prevebsa",
      "usuario prevebsa inactivo",
    ],
    respuesta:
      "Para recuperar acceso a PREVEBSA:\n\n1️⃣ En la pantalla de inicio toque *'Recuperar Contraseña'*\n2️⃣ Ingrese su correo registrado\n3️⃣ Revise bandeja de entrada y spam\n\n› Si aparece usuario inactivo → el administrador de su empresa debe reactivarlo.\n\n¿Cuál es su caso?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P7",
    app: "PREVEBSA",
    modulo: "Imágenes",
    keywords: [
      "no suben imagenes prevebsa",
      "imagenes no se guardan",
      "fotos no quedan",
      "no guarda fotos prevebsa",
      "actualizar imagenes",
    ],
    respuesta:
      "Después de agregar imágenes *debe* tocar *'Actualizar imágenes'* — sin ese paso no quedan guardadas.\n\nSi ya lo hizo y no funcionó:\n1️⃣ Verifique espacio en el dispositivo\n2️⃣ Borre caché de la app e intente de nuevo\n\n¿Quedaron guardadas?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P8",
    app: "PREVEBSA",
    modulo: "Notificaciones",
    keywords: [
      "no llegan notificaciones prevebsa",
      "notificaciones desactualizadas prevebsa",
      "segundo plano prevebsa",
      "no recibo notificaciones",
    ],
    respuesta:
      "Para solucionar notificaciones:\n\n1️⃣ Módulo *Notificaciones* → toque *Actualizar*\n2️⃣ *Configuración* en la app → active *'Segundo Plano'*\n3️⃣ *Ajustes del teléfono* → verifique que las notificaciones de PREVEBSA estén habilitadas\n\n¿Llegaron correctamente?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P9",
    app: "PREVEBSA",
    modulo: "Plan Diario",
    keywords: [
      "no aparece la inspeccion",
      "inspeccion no aparece en plan",
      "no puedo asignar inspeccion",
      "inspeccion no sale en plan diario",
    ],
    respuesta:
      "La inspección solo aparece en el plan si está en estado *'Completada'*.\n\n1️⃣ Módulo *Inspecciones* → busque la inspección\n2️⃣ Si dice *'Creada'*, debe finalizarla primero\n3️⃣ Si ya está Completada pero no aparece → cierre sesión, borre caché e ingrese de nuevo\n\n¿Pudo asignarla?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P10",
    app: "PREVEBSA",
    modulo: "Firmas",
    keywords: [
      "no puedo firmar",
      "firma no se guarda",
      "no deja firmar",
      "firmas trabajadores",
      "problema con firmas",
    ],
    respuesta:
      "El problema de firmas suele ser de conectividad:\n\n1️⃣ Active *Modo Offline* en Configuración\n2️⃣ Cierre y vuelva a abrir el formulario de trabajadores\n3️⃣ Si persiste, borre caché e intente de nuevo\n\n¿Pudo registrar las firmas?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P_PLAN_COMO",
    app: "PREVEBSA",
    modulo: "Planificaciones",
    keywords: [
      "como crear una planificacion",
      "como hago una planificacion",
      "como hago el plan diario",
      "paso a paso planificacion",
      "como se hace la planificacion",
    ],
    respuesta:
      "Cómo crear una planificación en PREVEBSA:\n\n*2 formatos:* Con Energía | Sin Energía\n\n1️⃣ *Datos iniciales:* persona que autoriza, zona, municipio, ubicación en Maps\n2️⃣ *Gráficos* (opcional): unifilar y rutograma\n3️⃣ *Inspección:* asigne la inspección preoperacional completada\n4️⃣ *Preguntas preliminares*\n5️⃣ *Actividades:* proceso → pasos → riesgos → barreras\n6️⃣ *Trabajadores:* función, firma y orden de trabajo\n7️⃣ Toque *'Enviar a Autorización'* ·\n\nEstados: · Creada → 🟠 Espera → · Autorizada → · Finalizada\n\n¿En qué paso tiene dificultad?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "P_INS_COMO",
    app: "PREVEBSA",
    modulo: "Inspecciones",
    keywords: [
      "como hacer una inspeccion prevebsa",
      "paso a paso inspeccion prevebsa",
      "como se hace la inspeccion",
      "como crear inspeccion prevebsa",
    ],
    respuesta:
      "Inspección preoperacional en PREVEBSA:\n\n*3 formatos:* 🚗 Vehículo | 🏍️ Moto | 🔧 Equipos Críticos\n\n1️⃣ Seleccione el formato\n2️⃣ Ingrese área y placa\n3️⃣ Verifique inspectores y firme\n4️⃣ Complete módulos: documentos, estado del vehículo, evidencias \n5️⃣ Agregue comentarios si aplica\n6️⃣ Toque *'Completar'*\n\n› Debe estar *Completada* para asignarla al plan diario.\n\n¿Tiene dificultad en algún paso?\n\n_Escriba *0* para hablar con un asesor_",
  },
  // ATIPOP
  {
    id: "A1",
    app: "ATIPOP",
    modulo: "FaceID",
    keywords: [
      "faceid",
      "face id",
      "atiface",
      "no reconoce la cara",
      "no me deja entrar con cara",
      "biometrico",
      "registrar cara",
      "foto no reconoce",
    ],
    respuesta:
      "Problema con FaceID:\n\n1️⃣ *Mi Cuenta → ATIFace* → verifique si su foto está registrada\n2️⃣ Si no está, tome una nueva foto con buena iluminación y fondo neutro\n3️⃣ Si ya estaba y falla, elimine el registro y vuelva a hacerlo\n\n¿Pudo ingresar?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A_LOGIN_CREDENCIALES",
    app: "ATIPOP",
    modulo: "Login",
    keywords: [
      "no puedo entrar atipop",
      "no puedo iniciar sesion atipop",
      "login atipop",
      "correo y contrasena atipop",
      "credenciales atipop",
      "no me deja entrar atipop",
      "usuario atipop",
      "contrasena atipop",
    ],
    respuesta:
      "El login de ATIPOP usa las credenciales del sistema *SGA*.\n\n1️⃣ Ingrese el correo y contraseña de SGA\n2️⃣ Sin espacios adicionales — distingue mayúsculas\n3️⃣ Si olvidó la contraseña → *'Recuperar Contraseña'* en la pantalla de inicio\n4️⃣ Si el correo no funciona → contacte a *Talento Humano*\n\n¿Qué mensaje de error le aparece?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A_LOGIN_FACEID_COMO",
    app: "ATIPOP",
    modulo: "Login FaceID",
    keywords: [
      "como iniciar sesion con faceid",
      "como entrar con faceid",
      "como usar faceid atipop",
      "paso a paso faceid",
      "como se usa el faceid",
    ],
    respuesta:
      "Para usar FaceID en ATIPOP:\n\n*Primero regístrelo:*\n1️⃣ *Mi Cuenta → ATIFace* → tome foto con buena iluminación → guarde\n\n*Para ingresar:*\n1️⃣ Abra ATIPOP → seleccione *FaceID*\n2️⃣ Posicione su rostro según las indicaciones\n\n› Si no lo reconoce, ingrese con correo y contraseña como alternativa.\n\n¿Tiene alguna dificultad?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A2",
    app: "ATIPOP",
    modulo: "Formularios",
    keywords: [
      "formulario sin dato",
      "formulario bloqueado",
      "aparece respondido",
      "datos corruptos",
      "no puedo editar formulario",
      "formulario lleno solo",
    ],
    respuesta:
      "Es caché corrupto. Solución:\n\n1️⃣ *Ajustes del teléfono → Aplicaciones → ATIPOP → Almacenamiento*\n2️⃣ *Borrar Datos* y *Borrar Caché*\n3️⃣ Inicie sesión de nuevo y abra el formulario\n\n› No cierre la app mientras carga el formulario.\n\n¿Quedó disponible?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A3",
    app: "ATIPOP",
    modulo: "Sincronización",
    keywords: [
      "no sincroniza atipop",
      "sincronizacion atipop",
      "datos viejos atipop",
      "informacion desactualizada atipop",
      "no carga informacion atipop",
    ],
    respuesta:
      "Para sincronizar ATIPOP:\n\n1️⃣ Menú lateral ☰ → *'Sincronizar'*\n2️⃣ Asegúrese de tener internet estable\n3️⃣ Si no carga → cierre sesión, vuelva a ingresar y sincronice\n\n▸ Sincronice al inicio de cada jornada.\n\n¿Ya cargó la información?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A4",
    app: "ATIPOP",
    modulo: "Recibos",
    keywords: [
      "recibos atipop",
      "recibo nomina",
      "desprendible",
      "no carga recibos",
      "tarda recibos",
      "modulo recibos lento",
    ],
    respuesta:
      "El módulo de Recibos es lento — es un problema conocido en corrección.\n\nMientras tanto:\n1️⃣ Espere al menos *30 segundos*\n2️⃣ Use *WiFi estable*\n3️⃣ Cierre y vuelva a abrir la app\n\n¿Pudo cargar los recibos?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A5",
    app: "ATIPOP",
    modulo: "Avisos",
    keywords: [
      "ver todos avisos",
      "boton avisos no funciona",
      "avisos se cierra",
      "ver todos no funciona",
    ],
    respuesta:
      "El botón *'Ver todos'* en Avisos tiene un error conocido en corrección.\n\nMientras tanto:\n→ Ingrese a *Avisos* directamente desde el menú principal\n→ Evite presionar *'Ver todos'* repetidamente\n\n¿Pudo ver sus avisos?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A6",
    app: "ATIPOP",
    modulo: "Certificaciones",
    keywords: [
      "certificacion no llega",
      "no se envia certificacion",
      "correo certificacion",
      "envio certificacion falla",
    ],
    respuesta:
      "El envío automático de certificaciones tiene fallas conocidas.\n\nSolución temporal:\n1️⃣ Descárguela manualmente desde el módulo correspondiente\n2️⃣ Envíela por correo adjuntando el archivo\n\n¿Pudo descargarla?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A7",
    app: "ATIPOP",
    modulo: "GPS",
    keywords: [
      "no llegan alertas gps",
      "alerta riesgo no llega",
      "gps atipop",
      "no vibra alerta",
      "emergencia no notifica",
      "alertas gps configurar",
    ],
    respuesta:
      "Para activar alertas GPS:\n\n1️⃣ *Configuración* en ATIPOP → ajuste la *distancia de alertas GPS*\n2️⃣ Active *alertas por vibración*\n3️⃣ *Ajustes del teléfono* → verifique permisos de *Ubicación* para ATIPOP\n\n¿Quedaron activadas?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A_REPORTE_RUTA",
    app: "ATIPOP",
    modulo: "Reporte en Ruta",
    keywords: [
      "reporte en ruta",
      "como hacer reporte",
      "reporte diario atipop",
      "crear reporte atipop",
      "reporte ruta atipop",
    ],
    respuesta:
      "Reporte en Ruta en ATIPOP:\n\n*Requisito:* GPS activo en el teléfono.\n\n1️⃣ *Ajustes del teléfono* → active *Ubicación* y permita acceso a ATIPOP\n2️⃣ Ingrese al módulo *'Reporte en Ruta'*\n3️⃣ Seleccione la ruta o subestación asignada\n4️⃣ Complete los datos → *'Guardar'*\n5️⃣ Sincronice cuando tenga señal\n\n¿Tiene dificultad en algún paso?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A_SUPERVISION",
    app: "ATIPOP",
    modulo: "Supervisiones",
    keywords: [
      "supervision atipop",
      "supervisiones atipop",
      "como hacer una supervision",
      "modulo supervision",
      "paso a paso supervision",
    ],
    respuesta:
      "Supervisiones en ATIPOP:\n\n1️⃣ Pantalla principal → *'Supervisiones e Inspecciones'*\n2️⃣ Seleccione el formato según el tipo de supervisión\n3️⃣ Complete: subestación, tipo y trabajador asignado\n4️⃣ Diligencie el formulario\n5️⃣ *'Guardar'* → *'Sincronizar'*\n\n› Si no ve la opción, verifique que su usuario tenga los permisos necesarios con el administrador.\n\n¿Tiene alguna dificultad?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A_INSPECCION_ATIPOP",
    app: "ATIPOP",
    modulo: "Inspecciones",
    keywords: [
      "inspeccion atipop",
      "como hacer inspeccion atipop",
      "paso a paso inspeccion atipop",
      "crear inspeccion atipop",
      "nueva inspeccion atipop",
    ],
    respuesta:
      "Inspección en ATIPOP:\n\n1️⃣ Pantalla principal → *'Supervisiones e Inspecciones'*\n2️⃣ Toque *'Nueva Inspección'* (botón + o 'Nueva')\n3️⃣ Seleccione subestación, tipo de inspección y trabajador\n4️⃣ Diligencie el formulario\n5️⃣ *'Guardar'* → *'Sincronizar'*\n\n¿Tiene dificultad en algún paso?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A_LECTURAS",
    app: "ATIPOP",
    modulo: "Lecturas",
    keywords: [
      "lecturas atipop",
      "como hacer una lectura",
      "registro lecturas",
      "lectura medidor",
      "lectura equipo",
      "nueva lectura atipop",
    ],
    respuesta:
      "Registro de lecturas en ATIPOP:\n\nPuede registrar: medidores (voltaje, corriente), códigos QR y equipos.\n\n1️⃣ *ATIPOP → Lecturas* → *'Nueva Lectura'*\n2️⃣ Seleccione subestación y medidor/equipo\n3️⃣ Ingrese los valores (voltaje, corriente, frecuencia)\n4️⃣ Tome foto si se requiere \n5️⃣ *'Guardar'* → *'Sincronizar'*\n\n¿En qué paso tiene dificultad?\n\n_Escriba *0* para hablar con un asesor_",
  },
  {
    id: "A_LECTURAS_PROBLEMA",
    app: "ATIPOP",
    modulo: "Lecturas",
    keywords: [
      "no sube lectura",
      "lectura no se guarda",
      "error en lecturas",
      "no puedo registrar lectura",
      "lectura falla",
      "no me deja subir foto lectura",
    ],
    respuesta:
      "Para el problema con lecturas:\n\n1️⃣ Verifique conexión o active *Modo Offline*\n2️⃣ Complete todos los campos obligatorios antes de guardar\n3️⃣ Si la foto no sube → *Ajustes del teléfono* → verifique permisos de *Cámara* para ATIPOP\n4️⃣ Si persiste → cierre app, borre caché e intente de nuevo\n\n¿Qué mensaje de error exacto le aparece?\n\n_Escriba *0* para hablar con un asesor_",
  },
];

function searchKnowledge(text, appFiltro) {
  const lower = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  for (const entry of knowledgeBase) {
    if (appFiltro && entry.app !== appFiltro) continue;
    for (const keyword of entry.keywords) {
      const kw = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (lower.includes(kw)) return entry;
    }
  }
  return null;
}

module.exports = { knowledgeBase, searchKnowledge };

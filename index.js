require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const AGENTES = ['573102614279', '573212135099'];
const modoHumano = new Set();
const agenteActivo = new Map();
const sessions = {};

// ============================================================
// KNOWLEDGE BASE
// ============================================================
const knowledgeBase = [
 // PREVEBSA
 { id:"P1", app:"PREVEBSA", modulo:"Plan Diario",
 keywords:["plan anterior","plan de ayer","plan viejo","aparece el plan de ayer","datos del dia anterior","cache plan","plan diario de ayer"],
 respuesta:"El problema se debe a datos en caché del día anterior.\n\n1️⃣ *Ajustes del teléfono → Aplicaciones → PREVEBSA → Almacenamiento → Borrar caché*\n2️⃣ Reinicie la app e ingrese de nuevo\n\n▸ Cierre sesión al finalizar cada jornada para evitarlo.\n\n¿Ya aparece el plan de hoy?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P2", app:"PREVEBSA", modulo:"Plan Diario",
 keywords:["no guarda","no quedan guardados","no se guarda","se pierden los cambios","perdi los cambios","no guardo al autorizar"],
 respuesta:"Puede ser sincronización o caché:\n\n1️⃣ Cierre sesión y vuelva a ingresar\n2️⃣ Si persiste: *Ajustes → Aplicaciones → PREVEBSA → Almacenamiento → Borrar caché*\n3️⃣ Verifique buena conexión antes de enviar a autorización\n\n¿Pudo guardar correctamente?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P3", app:"PREVEBSA", modulo:"Planificaciones",
 keywords:["cerro la planificacion","se cerro la planificacion","ya se envio y falta","necesito reabrir planificacion","reabrir planificacion","modificar planificacion enviada"],
 respuesta:"Una planificación enviada no se puede editar desde la app.\n\nDebe contactar al *administrador del sistema* con:\n→ Su nombre completo\n→ La razón del cambio\n\nEl administrador la reabrirá desde el módulo web *'Observar Planificaciones'*.\n\n¿Necesita algo más?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P4", app:"PREVEBSA", modulo:"Inspecciones",
 keywords:["cerro la inspeccion","se cerro la inspeccion","reabrir inspeccion","modificar inspeccion completada","inspeccion ya completada"],
 respuesta:"Una inspección completada no se puede editar desde la app.\n\nContacte al *administrador* con:\n→ Nombre del inspector\n→ Razón del cambio\n\nEl administrador la reabrirá desde *'Observar Inspecciones'* en la web.\n\n¿Necesita algo más?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P5", app:"PREVEBSA", modulo:"Conectividad",
 keywords:["lenta","no carga prevebsa","sin señal","mala señal","no funciona sin internet","modo offline prevebsa"],
 respuesta:"Para trabajar sin señal:\n\n1️⃣ *Configuración* en la app → active *Modo Offline*\n2️⃣ Trabaje normalmente\n3️⃣ Al tener señal, cambie a *Modo Online* para sincronizar\n\n¿Le funcionó?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P6", app:"PREVEBSA", modulo:"Acceso",
 keywords:["olvide contrasena prevebsa","no recuerdo clave prevebsa","recuperar contrasena prevebsa","no puedo entrar prevebsa","login prevebsa","contrasena prevebsa","usuario prevebsa inactivo"],
 respuesta:"Para recuperar acceso a PREVEBSA:\n\n1️⃣ En la pantalla de inicio toque *'Recuperar Contraseña'*\n2️⃣ Ingrese su correo registrado\n3️⃣ Revise bandeja de entrada y spam\n\n› Si aparece usuario inactivo → el administrador de su empresa debe reactivarlo.\n\n¿Cuál es su caso?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P7", app:"PREVEBSA", modulo:"Imágenes",
 keywords:["no suben imagenes prevebsa","imagenes no se guardan","fotos no quedan","no guarda fotos prevebsa","actualizar imagenes"],
 respuesta:"Después de agregar imágenes *debe* tocar *'Actualizar imágenes'* — sin ese paso no quedan guardadas.\n\nSi ya lo hizo y no funcionó:\n1️⃣ Verifique espacio en el dispositivo\n2️⃣ Borre caché de la app e intente de nuevo\n\n¿Quedaron guardadas?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P8", app:"PREVEBSA", modulo:"Notificaciones",
 keywords:["no llegan notificaciones prevebsa","notificaciones desactualizadas prevebsa","segundo plano prevebsa","no recibo notificaciones"],
 respuesta:"Para solucionar notificaciones:\n\n1️⃣ Módulo *Notificaciones* → toque *Actualizar*\n2️⃣ *Configuración* en la app → active *'Segundo Plano'*\n3️⃣ *Ajustes del teléfono* → verifique que las notificaciones de PREVEBSA estén habilitadas\n\n¿Llegaron correctamente?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P9", app:"PREVEBSA", modulo:"Plan Diario",
 keywords:["no aparece la inspeccion","inspeccion no aparece en plan","no puedo asignar inspeccion","inspeccion no sale en plan diario"],
 respuesta:"La inspección solo aparece en el plan si está en estado *'Completada'*.\n\n1️⃣ Módulo *Inspecciones* → busque la inspección\n2️⃣ Si dice *'Creada'*, debe finalizarla primero\n3️⃣ Si ya está Completada pero no aparece → cierre sesión, borre caché e ingrese de nuevo\n\n¿Pudo asignarla?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P10", app:"PREVEBSA", modulo:"Firmas",
 keywords:["no puedo firmar","firma no se guarda","no deja firmar","firmas trabajadores","problema con firmas"],
 respuesta:"El problema de firmas suele ser de conectividad:\n\n1️⃣ Active *Modo Offline* en Configuración\n2️⃣ Cierre y vuelva a abrir el formulario de trabajadores\n3️⃣ Si persiste, borre caché e intente de nuevo\n\n¿Pudo registrar las firmas?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P_PLAN_COMO", app:"PREVEBSA", modulo:"Planificaciones",
 keywords:["como crear una planificacion","como hago una planificacion","como hago el plan diario","paso a paso planificacion","como se hace la planificacion"],
 respuesta:"Cómo crear una planificación en PREVEBSA:\n\n*2 formatos:* Con Energía | Sin Energía\n\n1️⃣ *Datos iniciales:* persona que autoriza, zona, municipio, ubicación en Maps\n2️⃣ *Gráficos* (opcional): unifilar y rutograma\n3️⃣ *Inspección:* asigne la inspección preoperacional completada\n4️⃣ *Preguntas preliminares*\n5️⃣ *Actividades:* proceso → pasos → riesgos → barreras\n6️⃣ *Trabajadores:* función, firma y orden de trabajo\n7️⃣ Toque *'Enviar a Autorización'* ·\n\nEstados: · Creada → 🟠 Espera → · Autorizada → · Finalizada\n\n¿En qué paso tiene dificultad?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"P_INS_COMO", app:"PREVEBSA", modulo:"Inspecciones",
 keywords:["como hacer una inspeccion prevebsa","paso a paso inspeccion prevebsa","como se hace la inspeccion","como crear inspeccion prevebsa"],
 respuesta:"Inspección preoperacional en PREVEBSA:\n\n*3 formatos:* 🚗 Vehículo | 🏍️ Moto | 🔧 Equipos Críticos\n\n1️⃣ Seleccione el formato\n2️⃣ Ingrese área y placa\n3️⃣ Verifique inspectores y firme\n4️⃣ Complete módulos: documentos, estado del vehículo, evidencias \n5️⃣ Agregue comentarios si aplica\n6️⃣ Toque *'Completar'*\n\n› Debe estar *Completada* para asignarla al plan diario.\n\n¿Tiene dificultad en algún paso?\n\n_Escriba *0* para hablar con un asesor_" },

 // ATIPOP
 { id:"A1", app:"ATIPOP", modulo:"FaceID",
 keywords:["faceid","face id","atiface","no reconoce la cara","no me deja entrar con cara","biometrico","registrar cara","foto no reconoce"],
 respuesta:"Problema con FaceID:\n\n1️⃣ *Mi Cuenta → ATIFace* → verifique si su foto está registrada\n2️⃣ Si no está, tome una nueva foto con buena iluminación y fondo neutro\n3️⃣ Si ya estaba y falla, elimine el registro y vuelva a hacerlo\n\n¿Pudo ingresar?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A_LOGIN_CREDENCIALES", app:"ATIPOP", modulo:"Login",
 keywords:["no puedo entrar atipop","no puedo iniciar sesion atipop","login atipop","correo y contrasena atipop","credenciales atipop","no me deja entrar atipop","usuario atipop","contrasena atipop"],
 respuesta:"El login de ATIPOP usa las credenciales del sistema *SGA*.\n\n1️⃣ Ingrese el correo y contraseña de SGA\n2️⃣ Sin espacios adicionales — distingue mayúsculas\n3️⃣ Si olvidó la contraseña → *'Recuperar Contraseña'* en la pantalla de inicio\n4️⃣ Si el correo no funciona → contacte a *Talento Humano*\n\n¿Qué mensaje de error le aparece?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A_LOGIN_FACEID_COMO", app:"ATIPOP", modulo:"Login FaceID",
 keywords:["como iniciar sesion con faceid","como entrar con faceid","como usar faceid atipop","paso a paso faceid","como se usa el faceid"],
 respuesta:"Para usar FaceID en ATIPOP:\n\n*Primero regístrelo:*\n1️⃣ *Mi Cuenta → ATIFace* → tome foto con buena iluminación → guarde\n\n*Para ingresar:*\n1️⃣ Abra ATIPOP → seleccione *FaceID*\n2️⃣ Posicione su rostro según las indicaciones\n\n› Si no lo reconoce, ingrese con correo y contraseña como alternativa.\n\n¿Tiene alguna dificultad?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A2", app:"ATIPOP", modulo:"Formularios",
 keywords:["formulario sin dato","formulario bloqueado","aparece respondido","datos corruptos","no puedo editar formulario","formulario lleno solo"],
 respuesta:"Es caché corrupto. Solución:\n\n1️⃣ *Ajustes del teléfono → Aplicaciones → ATIPOP → Almacenamiento*\n2️⃣ *Borrar Datos* y *Borrar Caché*\n3️⃣ Inicie sesión de nuevo y abra el formulario\n\n› No cierre la app mientras carga el formulario.\n\n¿Quedó disponible?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A3", app:"ATIPOP", modulo:"Sincronización",
 keywords:["no sincroniza atipop","sincronizacion atipop","datos viejos atipop","informacion desactualizada atipop","no carga informacion atipop"],
 respuesta:"Para sincronizar ATIPOP:\n\n1️⃣ Menú lateral ☰ → *'Sincronizar'*\n2️⃣ Asegúrese de tener internet estable\n3️⃣ Si no carga → cierre sesión, vuelva a ingresar y sincronice\n\n▸ Sincronice al inicio de cada jornada.\n\n¿Ya cargó la información?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A4", app:"ATIPOP", modulo:"Recibos",
 keywords:["recibos atipop","recibo nomina","desprendible","no carga recibos","tarda recibos","modulo recibos lento"],
 respuesta:"El módulo de Recibos es lento — es un problema conocido en corrección.\n\nMientras tanto:\n1️⃣ Espere al menos *30 segundos*\n2️⃣ Use *WiFi estable*\n3️⃣ Cierre y vuelva a abrir la app\n\n¿Pudo cargar los recibos?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A5", app:"ATIPOP", modulo:"Avisos",
 keywords:["ver todos avisos","boton avisos no funciona","avisos se cierra","ver todos no funciona"],
 respuesta:"El botón *'Ver todos'* en Avisos tiene un error conocido en corrección.\n\nMientras tanto:\n→ Ingrese a *Avisos* directamente desde el menú principal\n→ Evite presionar *'Ver todos'* repetidamente\n\n¿Pudo ver sus avisos?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A6", app:"ATIPOP", modulo:"Certificaciones",
 keywords:["certificacion no llega","no se envia certificacion","correo certificacion","envio certificacion falla"],
 respuesta:"El envío automático de certificaciones tiene fallas conocidas.\n\nSolución temporal:\n1️⃣ Descárguela manualmente desde el módulo correspondiente\n2️⃣ Envíela por correo adjuntando el archivo\n\n¿Pudo descargarla?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A7", app:"ATIPOP", modulo:"GPS",
 keywords:["no llegan alertas gps","alerta riesgo no llega","gps atipop","no vibra alerta","emergencia no notifica","alertas gps configurar"],
 respuesta:"Para activar alertas GPS:\n\n1️⃣ *Configuración* en ATIPOP → ajuste la *distancia de alertas GPS*\n2️⃣ Active *alertas por vibración*\n3️⃣ *Ajustes del teléfono* → verifique permisos de *Ubicación* para ATIPOP\n\n¿Quedaron activadas?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A_REPORTE_RUTA", app:"ATIPOP", modulo:"Reporte en Ruta",
 keywords:["reporte en ruta","como hacer reporte","reporte diario atipop","crear reporte atipop","reporte ruta atipop"],
 respuesta:"Reporte en Ruta en ATIPOP:\n\n*Requisito:* GPS activo en el teléfono.\n\n1️⃣ *Ajustes del teléfono* → active *Ubicación* y permita acceso a ATIPOP\n2️⃣ Ingrese al módulo *'Reporte en Ruta'*\n3️⃣ Seleccione la ruta o subestación asignada\n4️⃣ Complete los datos → *'Guardar'*\n5️⃣ Sincronice cuando tenga señal\n\n¿Tiene dificultad en algún paso?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A_SUPERVISION", app:"ATIPOP", modulo:"Supervisiones",
 keywords:["supervision atipop","supervisiones atipop","como hacer una supervision","modulo supervision","paso a paso supervision"],
 respuesta:"Supervisiones en ATIPOP:\n\n1️⃣ Pantalla principal → *'Supervisiones e Inspecciones'*\n2️⃣ Seleccione el formato según el tipo de supervisión\n3️⃣ Complete: subestación, tipo y trabajador asignado\n4️⃣ Diligencie el formulario\n5️⃣ *'Guardar'* → *'Sincronizar'*\n\n› Si no ve la opción, verifique que su usuario tenga los permisos necesarios con el administrador.\n\n¿Tiene alguna dificultad?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A_INSPECCION_ATIPOP", app:"ATIPOP", modulo:"Inspecciones",
 keywords:["inspeccion atipop","como hacer inspeccion atipop","paso a paso inspeccion atipop","crear inspeccion atipop","nueva inspeccion atipop"],
 respuesta:"Inspección en ATIPOP:\n\n1️⃣ Pantalla principal → *'Supervisiones e Inspecciones'*\n2️⃣ Toque *'Nueva Inspección'* (botón + o 'Nueva')\n3️⃣ Seleccione subestación, tipo de inspección y trabajador\n4️⃣ Diligencie el formulario\n5️⃣ *'Guardar'* → *'Sincronizar'*\n\n¿Tiene dificultad en algún paso?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A_LECTURAS", app:"ATIPOP", modulo:"Lecturas",
 keywords:["lecturas atipop","como hacer una lectura","registro lecturas","lectura medidor","lectura equipo","nueva lectura atipop"],
 respuesta:"Registro de lecturas en ATIPOP:\n\nPuede registrar: medidores (voltaje, corriente), códigos QR y equipos.\n\n1️⃣ *ATIPOP → Lecturas* → *'Nueva Lectura'*\n2️⃣ Seleccione subestación y medidor/equipo\n3️⃣ Ingrese los valores (voltaje, corriente, frecuencia)\n4️⃣ Tome foto si se requiere \n5️⃣ *'Guardar'* → *'Sincronizar'*\n\n¿En qué paso tiene dificultad?\n\n_Escriba *0* para hablar con un asesor_" },

 { id:"A_LECTURAS_PROBLEMA", app:"ATIPOP", modulo:"Lecturas",
 keywords:["no sube lectura","lectura no se guarda","error en lecturas","no puedo registrar lectura","lectura falla","no me deja subir foto lectura"],
 respuesta:"Para el problema con lecturas:\n\n1️⃣ Verifique conexión o active *Modo Offline*\n2️⃣ Complete todos los campos obligatorios antes de guardar\n3️⃣ Si la foto no sube → *Ajustes del teléfono* → verifique permisos de *Cámara* para ATIPOP\n4️⃣ Si persiste → cierre app, borre caché e intente de nuevo\n\n¿Qué mensaje de error exacto le aparece?\n\n_Escriba *0* para hablar con un asesor_" }
];

// ============================================================
// HELPERS
// ============================================================

function getSession(phone) {
 if (!sessions[phone]) {
 sessions[phone] = { history: [], attempts: 0, primerMensaje: true, nombre: null, contexto: null, menu: null, app: null };
 }
 return sessions[phone];
}

function searchKnowledge(text, appFiltro) {
 const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
 for (const entry of knowledgeBase) {
 if (appFiltro && entry.app !== appFiltro) continue;
 for (const keyword of entry.keywords) {
 const kw = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
 if (lower.includes(kw)) return entry;
 }
 }
 return null;
}

const OPCION_ASESOR = '\n\n_Escriba *#* para hablar con un asesor_';

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
 const alerta = `▣ *NUEVO CASO DE SOPORTE*\n\n· Usuario: +${phone}\n· Mensaje: "${texto}"\n\nPara atender escriba:\n› *#agente ${phone}*\n\nPara terminar:\n› *#bot*`;
 for (const agente of AGENTES) {
 try { await sendWhatsApp(agente, alerta); } catch (e) { console.error(e.message); }
 }
}

async function askClaude(userMessage, history, nombre, contexto, appActual) {
 const appNombre = appActual === 'PREVEBSA' ? 'PREVEBSA (seguridad y salud en el trabajo - HSE)' :
 appActual === 'ATIPOP' ? 'ATIPOP (gestión de subestaciones eléctricas)' : 'ATIPOP o PREVEBSA';

 const systemPrompt = `Usted es el asistente de soporte técnico de ATI para los aplicativos ATIPOP y PREVEBSA.

CONTEXTO ACTUAL: El usuario está consultando sobre *${appNombre}*.
${contexto ? `MÓDULO ACTUAL: ${contexto}` : ''}
${nombre ? `Nombre del usuario: ${nombre}` : ''}

REGLAS — sígalas estrictamente:
1. Responda SIEMPRE sobre ${appActual || 'el aplicativo indicado'} — NUNCA cambie de aplicativo
2. NUNCA mencione FaceID si el módulo actual es Lecturas, Inspecciones, Supervisiones, Reporte en Ruta u Otro
3. FaceID SOLO aplica al módulo de Login/Mi Cuenta de ATIPOP
4. Sea directo y conciso — respuestas cortas con pasos claros
5. Si describe un problema, primero pregunte el error exacto antes de asumir
6. Al final de CADA respuesta incluya siempre: "_Escriba *0* para hablar con un asesor_"
7. Tono formal y cordial — use "usted"
8. Si no sabe con certeza, dígalo y ofrezca escalar con un asesor

ATIPOP — Módulos: Login (SGA/FaceID), Mi Cuenta (ATIFace, carnet, documentos, vehículo), Sincronizar, Configuración (GPS, vibración), Reporte en Ruta, Supervisiones e Inspecciones, Lecturas (medidores/QR/equipos), Equipos
PREVEBSA — Módulos: Planificaciones (2 formatos: Con/Sin Energía), Inspecciones (3 formatos: Vehículo/Moto/Equipos Críticos), Observaciones, Planes de Acción, Módulo Proceso, Configuración, Notificaciones`;

 const messages = [
 ...history.map(h => ({ role: h.role, content: h.content })),
 { role: 'user', content: userMessage }
 ];

 const response = await fetch('https://api.anthropic.com/v1/messages', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.CLAUDE_API_KEY, 'anthropic-version': '2023-06-01' },
 body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, system: systemPrompt, messages })
 });

 const data = await response.json();
 if (data.error) throw new Error(JSON.stringify(data.error));
 return data.content[0].text;
}

// ============================================================
// MENÚS
// ============================================================

const MENU_PRINCIPAL = `✦ Bienvenido al soporte técnico de *ATI*

¿Con cuál aplicativo necesita ayuda?

1️⃣ *PREVEBSA*
   Seguridad y salud en el trabajo (HSE)
2️⃣ *ATIPOP*
   Operación, montaje y mantenimiento eléctrico
3️⃣ *TUTORIALES*
   Videos de uso paso a paso
*#️⃣ ASESOR*
   Escriba *asesor* para hablar con una persona

_Responda con el número_ · Escriba *#* para hablar con un asesor 👇`;

const MENU_PREVEBSA = `📱 *PREVEBSA* — ¿En qué le ayudo?

1️⃣ *Login / Contraseña*
   Problemas para ingresar o recuperar clave
2️⃣ *Planificaciones*
   Crear o gestionar el plan diario
3️⃣ *Inspecciones preoperacionales*
   Vehículo, moto o equipos críticos
4️⃣ *Observaciones*
   Registrar hallazgos en campo
5️⃣ *Planes de Acción*
   Seguimiento a hallazgos y correctivos
6️⃣ *Módulo Proceso*
   Seguimiento de envíos e imágenes
7️⃣ *Configuración / Notificaciones*
   Modo offline, segundo plano, alertas
8️⃣ *Otro problema*
   Inconveniente no listado

_Indique el número_ · Escriba *#* para hablar con un asesor 👇`;

const MENU_ATIPOP = `📱 *ATIPOP* — ¿En qué le ayudo?

1️⃣ *Inicio de sesión*
   Problemas con correo, contraseña o FaceID
2️⃣ *Mi Cuenta / Documentos*
   Perfil, carnet, nómina, vehículo
3️⃣ *Reporte en Ruta*
   Crear o gestionar reportes diarios
4️⃣ *Supervisiones e Inspecciones*
   Registrar supervisiones o inspecciones
5️⃣ *Lecturas / Equipos*
   Medidores, valores, equipos asignados
6️⃣ *Sincronización*
   Datos desactualizados o sin cargar
7️⃣ *Configuración / GPS / Alertas*
   Distancia GPS, vibración, segundo plano
8️⃣ *Otro problema*
   Inconveniente no listado

_Indique el número_ · Escriba *#* para hablar con un asesor 👇`;

const MENSAJE_AGENTE = `Disculpe los inconvenientes.

Un asesor de ATI le responderá en breve desde este número. 

Si desea, comparta más detalles o una captura de pantalla para agilizar la atención.`;

const MENU_TUTORIALES = `*Tutoriales* — ¿De cuál aplicativo?

1️⃣ PREVEBSA
2️⃣ ATIPOP
0️⃣ Volver al menú principal`;

const MENU_TUTORIALES_PREVEBSA = `*Tutoriales PREVEBSA:*

1️⃣ Login en PREVEBSA
2️⃣ Plan Diario en PREVEBSA
3️⃣ Inspecciones en PREVEBSA
0️⃣ Volver`;

// ── MENÚ ATIPOP ACTUALIZADO con los 3 tutoriales nuevos ──────
const MENU_TUTORIALES_ATIPOP = `*Tutoriales ATIPOP:*

1️⃣ Inicio de sesión con FaceID
2️⃣ Registro de asistencia
3️⃣ Cómo registrar FaceID
4️⃣ Login con correo y contraseña
5️⃣ Cómo borrar caché
6️⃣ Recuperar contraseña
0️⃣ Volver`;

const VIDEOS_PREVEBSA = {
  '1': { url: 'https://drive.google.com/uc?export=download&id=1xiZ9qBOp7W8zb9sEfs-3U9v-1aLHUsYQ', titulo: 'Tutorial: Login en PREVEBSA' },
  '2': { url: 'https://drive.google.com/uc?export=download&id=1r3XjnUIWM8T8lEXptBJKMUmZ09SF8SJ4', titulo: 'Tutorial: Plan Diario en PREVEBSA' },
  '3': { url: 'https://drive.google.com/uc?export=download&id=1d23W40kT64R4zJ01qgYTDlAOfudVA9JB', titulo: 'Tutorial: Inspecciones en PREVEBSA' }
};

// ── VIDEOS ATIPOP ACTUALIZADOS ────────────────────────────────
// Opciones 1-3: nuevos tutoriales
// Opciones 4-6: tutoriales existentes reubicados
const VIDEOS_ATIPOP = {
  '1': { url: 'https://drive.google.com/uc?export=download&id=1PkSvTmNZoZ69VLwDIgc5QoiVl9edDYkl', titulo: 'Tutorial: Inicio de sesión con FaceID en ATIPOP' },
  '2': { url: 'https://drive.google.com/uc?export=download&id=1wbArXIY2ajQcLM0kWfcyOaaA2N_WTkwi', titulo: 'Tutorial: Registro de asistencia en ATIPOP' },
  '3': { url: 'https://drive.google.com/uc?export=download&id=1jPswGIwLkJ60pwjtYWv4kulGXnpGi4Yv', titulo: 'Tutorial: Cómo registrar FaceID en ATIPOP' },
  '4': { url: 'https://drive.google.com/uc?export=download&id=115kK2LCCS43mfD2S9wWJ266zmzdl_LvZ', titulo: 'Tutorial: Login con correo y contraseña en ATIPOP' },
  '5': { url: 'https://drive.google.com/uc?export=download&id=1K-F66G0Mu4vHzF9-vrt42QnUoGUrEDLR', titulo: 'Tutorial: Cómo borrar caché' },
  '6': { url: 'https://drive.google.com/uc?export=download&id=1-tVGXmw_NqvBqTgX7Wkc0nMURgLXSOrh', titulo: 'Tutorial: Recuperar contraseña ATIPOP' }
};

const CONTEXTOS = {
 'prevebsa_1': 'Login o recuperación de contraseña en PREVEBSA',
 'prevebsa_2': 'Planificaciones en PREVEBSA. Solo hay 2 formatos: Con Energía y Sin Energía',
 'prevebsa_3': 'Inspecciones Preoperacionales en PREVEBSA. Hay 3 formatos: Vehículo, Moto, Equipos Críticos',
 'prevebsa_4': 'Observaciones en PREVEBSA',
 'prevebsa_5': 'Planes de Acción en PREVEBSA',
 'prevebsa_6': 'Módulo Proceso en PREVEBSA',
 'prevebsa_7': 'Configuración o Notificaciones en PREVEBSA',
 'prevebsa_8': 'Problema general en PREVEBSA. NO mencione ATIPOP ni FaceID',
 'atipop_1': 'Login en ATIPOP. Puede ser con correo/contraseña (SGA) o FaceID — son flujos distintos, pregunte cuál',
 'atipop_2': 'Mi Cuenta o Documentos en ATIPOP',
 'atipop_3': 'Reporte en Ruta en ATIPOP',
 'atipop_4': 'Supervisiones e Inspecciones en ATIPOP. NO mencione FaceID',
 'atipop_5': 'Lecturas o Equipos en ATIPOP. NO mencione FaceID',
 'atipop_6': 'Sincronización en ATIPOP',
 'atipop_7': 'Configuración, GPS o Alertas en ATIPOP',
 'atipop_8': 'Problema general en ATIPOP. NO mencione PREVEBSA. NO mencione FaceID a menos que el usuario lo indique'
};

async function enviarVideo(to, video) {
  if (!video) return;
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'video', video: { link: video.url, caption: video.titulo } })
    });
    const data = await res.json();
    // Si la API de Meta rechaza el enlace directo, enviar link alternativo
    if (data.error) throw new Error(data.error.message);
  } catch {
    const fileId = video.url.split('id=')[1];
    await sendWhatsApp(to, `*${video.titulo}*\n\n› Ver tutorial: https://drive.google.com/file/d/${fileId}/view`);
  }
}

// ============================================================
// REENVÍO DE MEDIA AL ASESOR — versión corregida
// ============================================================
// Estrategia: descarga el archivo desde Meta y lo reenvía al
// asesor usando su media_id original (evita re-subir cuando
// el archivo ya está en los servidores de Meta).
async function reenviarMediaAlAsesor(agentePhone, clientePhone, message) {
  const tipo = message.type;
  const mediaObj = message[tipo];
  if (!mediaObj) return;

  const tipoLabel = {
    image: 'imagen', audio: 'audio', video: 'video',
    document: 'documento', sticker: 'sticker'
  }[tipo] || tipo;

  try {
    // 1. Avisar al asesor quién envió el archivo
    await sendWhatsApp(agentePhone, `📎 *Usuario +${clientePhone}* envió ${tipoLabel === 'imagen' ? 'una' : 'un'} *${tipoLabel}*:`);

    // 2. Reenviar usando el media_id directamente (más eficiente,
    //    no requiere descargar ni re-subir)
    const body = {
      messaging_product: 'whatsapp',
      to: agentePhone,
      type: tipo
    };

    // Construir el objeto del medio con id y caption si aplica
    body[tipo] = { id: mediaObj.id };
    if (mediaObj.caption && tipo !== 'audio' && tipo !== 'sticker') {
      body[tipo].caption = mediaObj.caption;
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    const data = await res.json();

    // Si Meta devuelve error (p.ej. media_id expirado), notificar sin crash
    if (data.error) {
      console.error('Error reenviando media:', data.error.message);
      await sendWhatsApp(
        agentePhone,
        `⚠️ No se pudo reenviar el ${tipoLabel} automáticamente. Revise el chat del usuario +${clientePhone} directamente en WhatsApp.`
      );
    }
  } catch (e) {
    console.error('reenviarMediaAlAsesor error:', e.message);
    try {
      await sendWhatsApp(
        agentePhone,
        `⚠️ Error al reenviar el ${tipoLabel} del usuario +${clientePhone}. Revíselo directamente en WhatsApp.`
      );
    } catch (_) {}
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
    if (!message) return;

    const tipo = message.type;
    const phone = message.from;

    // ── Media de cliente en modo humano → reenviar al asesor ──
    if (modoHumano.has(phone) && tipo !== 'text') {
      // Buscar el asesor asignado a este cliente
      let agenteAsignado = null;
      for (const [agente, cliente] of agenteActivo.entries()) {
        if (cliente === phone) { agenteAsignado = agente; break; }
      }

      // Reenviar a su asesor asignado, o a todos si aún no hay uno
      const destinos = agenteAsignado ? [agenteAsignado] : AGENTES;
      for (const dest of destinos) {
        await reenviarMediaAlAsesor(dest, phone, message);
      }
      return;
    }

    if (tipo !== 'text') return;

 const text = message.text.body.trim();
 console.log(`📩 De ${phone}: ${text}`);

 // ── Comandos de agentes ───────────────────────────────────
 if (AGENTES.includes(phone)) {
 if (text.startsWith('#agente ')) {
 const cliente = text.split('#agente ')[1].trim();
 modoHumano.add(cliente);
 agenteActivo.set(phone, cliente);
 await sendWhatsApp(phone, `*Asesor activo* — Atendiendo a +${cliente}\n\nEscriba normalmente y sus mensajes llegarán al usuario.\nPara terminar escriba: *#bot*`);
 await sendWhatsApp(cliente, 'Un asesor de ATI está disponible. ¿En qué le puedo ayudar?');
 return;
 }
 if (text === '#bot') {
 const cliente = agenteActivo.get(phone);
 if (cliente) {
 modoHumano.delete(cliente);
 agenteActivo.delete(phone);
 getSession(cliente).attempts = 0;
 await sendWhatsApp(phone, `· Caso finalizado. Bot reactivado para +${cliente}`);
 await sendWhatsApp(cliente, 'El asistente virtual está disponible nuevamente.\n\nEscriba *menu* si necesita más ayuda.');
 } else {
      await sendWhatsApp(phone, 'No tiene ningún caso activo en este momento.');
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

 // ── Cliente en modo humano ────────────────────────────────
 if (modoHumano.has(phone)) {
 let agenteAsignado = null;
 for (const [agente, cliente] of agenteActivo.entries()) {
 if (cliente === phone) { agenteAsignado = agente; break; }
 }
    if (agenteAsignado) {
      await sendWhatsApp(agenteAsignado, `*Usuario +${phone}:*\n${text}`);
    } else {
      for (const agente of AGENTES) {
        try { await sendWhatsApp(agente, `*Usuario +${phone}:*\n${text}\n\n_Escriba *#agente ${phone}* para atender_`); } catch (e) {}
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

 const textLower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

 // ── Reiniciar ─────────────────────────────────────────────
 if (['menu', 'inicio', 'hola', 'start', 'reiniciar'].includes(textLower)) {
 Object.assign(session, { attempts: 0, history: [], contexto: null, menu: null, app: null });
 await sendWhatsApp(phone, MENU_PRINCIPAL);
 return;
 }

    // ── Tutoriales con submenú ────────────────────────────────
    if (session.menu === 'tutoriales') {
      if (text === '0') { session.menu = null; session.app = null; await sendWhatsApp(phone, MENU_PRINCIPAL); return; }
      if (text === '1') { session.menu = 'tutoriales_prevebsa'; await sendWhatsApp(phone, MENU_TUTORIALES_PREVEBSA); return; }
      if (text === '2') { session.menu = 'tutoriales_atipop'; await sendWhatsApp(phone, MENU_TUTORIALES_ATIPOP); return; }
    }
    if (session.menu === 'tutoriales_prevebsa') {
      if (text === '0') { session.menu = 'tutoriales'; await sendWhatsApp(phone, MENU_TUTORIALES); return; }
      const video = VIDEOS_PREVEBSA[text];
      if (video) {
        await sendWhatsApp(phone, 'Enviando tutorial...');
        await enviarVideo(phone, video);
        await sendWhatsApp(phone, '¿Necesita ayuda con algo más? Escriba *menu* para volver.' + OPCION_ASESOR);
        return;
      }
    }
    if (session.menu === 'tutoriales_atipop') {
      if (text === '0') { session.menu = 'tutoriales'; await sendWhatsApp(phone, MENU_TUTORIALES); return; }
      const video = VIDEOS_ATIPOP[text];
      if (video) {
        await sendWhatsApp(phone, 'Enviando tutorial...');
        await enviarVideo(phone, video);
        await sendWhatsApp(phone, '¿Necesita ayuda con algo más? Escriba *menu* para volver.' + OPCION_ASESOR);
        return;
      }
    }

    // ── Asesor: # o palabra clave ────────────────────────────
    const palabrasAsesor = ['asesor', 'agente', 'humano', 'hablar con alguien'];
    if (text === '#' || palabrasAsesor.some(p => textLower.includes(p))) {
      await sendWhatsApp(phone, MENSAJE_AGENTE);
      await notificarAgentes(phone, `Solicitud de asesor. Módulo: ${session.contexto || 'menú principal'}. Mensaje: "${text}"`);
      modoHumano.add(phone);
      return;
    }

    // ── Navegación menú principal ─────────────────────────────
    if (!session.menu || session.menu === 'principal') {
 if (text === '1' || textLower.includes('prevebsa')) {
 session.menu = 'prevebsa'; session.app = 'PREVEBSA'; session.contexto = null;
 await sendWhatsApp(phone, MENU_PREVEBSA);
 return;
 }
 if (text === '2' || textLower.includes('atipop')) {
 session.menu = 'atipop'; session.app = 'ATIPOP'; session.contexto = null;
 await sendWhatsApp(phone, MENU_ATIPOP);
 return;
 }
 if (text === '3') {
 session.menu = 'tutoriales';
 await sendWhatsApp(phone, MENU_TUTORIALES);
 return;
 }
 }

    // ── 0 = volver en cualquier submenú ──────────────────────
    if (text === '0') {
      if (session.menu && session.menu !== 'principal') {
        if (session.contexto) { session.contexto = null; }
        else { session.menu = null; session.app = null; }
        const menuVolver = session.menu === 'prevebsa' ? MENU_PREVEBSA : session.menu === 'atipop' ? MENU_ATIPOP : MENU_PRINCIPAL;
        await sendWhatsApp(phone, menuVolver);
      } else {
        await sendWhatsApp(phone, MENU_PRINCIPAL);
      }
      return;
    }

    // ── Submenú PREVEBSA ──────────────────────────────────────
    if (session.menu === 'prevebsa' && !session.contexto) {
 const ops = { '1':'prevebsa_1','2':'prevebsa_2','3':'prevebsa_3','4':'prevebsa_4','5':'prevebsa_5','6':'prevebsa_6','7':'prevebsa_7','8':'prevebsa_8' };
 if (ops[text]) {
 session.contexto = ops[text];
 const preguntas = {
 'prevebsa_1': '¿Olvidó la contraseña, su usuario aparece inactivo, o no puede ingresar con sus credenciales?' + OPCION_ASESOR,
 'prevebsa_2': '¿No puede crear la planificación, se perdieron los datos, necesita reabrirla, o tiene otro inconveniente?' + OPCION_ASESOR,
 'prevebsa_3': '¿No puede crear la inspección, necesita reabrirla, o no aparece para asignarla al plan diario?' + OPCION_ASESOR,
 'prevebsa_4': '¿Cuál es el inconveniente con las observaciones?' + OPCION_ASESOR,
 'prevebsa_5': '¿Cuál es el inconveniente con los planes de acción?' + OPCION_ASESOR,
 'prevebsa_6': '¿Cuál es el inconveniente con el Módulo Proceso?' + OPCION_ASESOR,
 'prevebsa_7': '¿El inconveniente es con la configuración, las notificaciones, o el modo offline?' + OPCION_ASESOR,
 'prevebsa_8': '¿Cuál es el inconveniente con PREVEBSA? Cuénteme con detalle.' + OPCION_ASESOR
 };
 await sendWhatsApp(phone, preguntas[session.contexto]);
 return;
 }
 }

 // ── Submenú ATIPOP ────────────────────────────────────────
 if (session.menu === 'atipop' && !session.contexto) {
 const ops = { '1':'atipop_1','2':'atipop_2','3':'atipop_3','4':'atipop_4','5':'atipop_5','6':'atipop_6','7':'atipop_7','8':'atipop_8' };
 if (ops[text]) {
 session.contexto = ops[text];
 const preguntas = {
 'atipop_1': '¿El inconveniente es con el inicio de sesión con *correo y contraseña*, o con *FaceID*?' + OPCION_ASESOR,
 'atipop_2': '¿Cuál es el inconveniente con Mi Cuenta o Documentos?' + OPCION_ASESOR,
 'atipop_3': '¿Cuál es el inconveniente con el Reporte en Ruta?' + OPCION_ASESOR,
 'atipop_4': '¿Cuál es el inconveniente con Supervisiones e Inspecciones?' + OPCION_ASESOR,
 'atipop_5': '¿El inconveniente es con *Lecturas* (medidores, valores) o con *Equipos* (historial, devolutivos)?' + OPCION_ASESOR,
 'atipop_6': '¿La app no sincroniza, se queda pegada, o muestra información desactualizada?' + OPCION_ASESOR,
 'atipop_7': '¿El inconveniente es con la configuración, las alertas GPS, o algo más?' + OPCION_ASESOR,
 'atipop_8': '¿Cuál es el inconveniente con ATIPOP? Cuénteme con detalle.' + OPCION_ASESOR
 };
 await sendWhatsApp(phone, preguntas[session.contexto]);
 return;
 }
 }

    // ── Knowledge base ────────────────────────────────────────
    const match = searchKnowledge(text, session.app);
 if (match) {
 session.attempts = 0;
 session.history.push({ role: 'user', content: text });
 session.history.push({ role: 'assistant', content: match.respuesta });
 await sendWhatsApp(phone, match.respuesta);
 return;
 }

 // ── Contar intentos fallidos → escalar a los 5 ────────────
 const frasesFallo = ['no funciono','sigue igual','no sirve','no pude','todavia no','aun no','sigue el problema','no se soluciono','no resulto','tampoco funciono'];
 if (frasesFallo.some(f => textLower.includes(f))) session.attempts++;

 if (session.attempts >= 5) {
 await sendWhatsApp(phone, MENSAJE_AGENTE);
 await notificarAgentes(phone, `5 intentos sin resolver. Módulo: ${session.contexto || 'general'}. Último mensaje: "${text}"`);
 modoHumano.add(phone);
 session.attempts = 0;
 return;
 }

 // ── Claude ────────────────────────────────────────────────
 const contextoActual = session.contexto ? CONTEXTOS[session.contexto] : null;
 const reply = await askClaude(text, session.history, session.nombre, contextoActual, session.app);
 session.history.push({ role: 'user', content: text });
 session.history.push({ role: 'assistant', content: reply });
 if (session.history.length > 12) session.history = session.history.slice(-12);

 await sendWhatsApp(phone, reply);

 } catch (error) {
 console.error('❌ Error:', error.message);
 }
});

app.get('/', (req, res) => res.json({ status: '· ATI Bot funcionando', timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ATI Bot corriendo en puerto ${PORT}`));
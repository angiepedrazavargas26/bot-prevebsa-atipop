// bot/contextos/index.js
// EDITE ESTOS TEXTOS. Cada clave corresponde a una opción del menú interactivo.
// Incluya: funcionamiento normal, errores típicos y cómo resolverlos.
// La IA usará EXACTAMENTE este texto como contexto y NO podrá salirse de él.

const CONTEXTOS = {
  prevebsa_1: `=== LOGIN / CONTRASEÑA — PREVEBSA ===

FUNCIONAMIENTO NORMAL:
- El usuario ingresa con usuario y contraseña creados por el administrador.
- Si olvida la contraseña, debe usar la opción "Olvidé mi contraseña" dentro de la app.
- El sistema envía un correo de recuperación al email registrado.
- La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número  y simbolo.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No puedo ingresar / contraseña incorrecta"
   - Verificar que Caps Lock esté desactivado.
   - Confirmar usuario y contraseña escritos correctamente.
   - Si persiste, usar "Olvidé mi contraseña" en la pantalla de login.
   - Si no llega el correo, verificar carpeta de spam o correo no deseado.

2. "No me llega el correo de recuperación"
   - Esperar entre 5 y 10 minutos.
   - Revisar spam, correo no deseado o filtros.
   - Confirmar que el correo registrado sea el correcto.
   - Si persiste, decirle darle la opcion de comunicarse con un asesor para que actualice la contraseña en el sistema.

3. "Usuario aparece inactivo"
   - decirle que se conecte con un asesor para solucionar este problema en especifico.

4. "FaceID / huella no funciona en PREVEBSA"
   - PREVEBSA NO usa biometría. Debe ingresar con usuario y contraseña.
   - Indicar que esta función no está disponible en PREVEBSA.

REGLA CRÍTICA: Solo responda sobre Login/Contraseña de PREVEBSA. Si se consulta por otro módulo o ATIPOP, indique que debe escribir *#* para hablar con un asesor.`,

  prevebsa_2: `=== PLANIFICACIONES — PREVEBSA ===

FUNCIONAMIENTO NORMAL:
- PREVEBSA tiene 2 formatos de planificación: ft-ms-14 y ft-ms-20.
- Se recomienda sincronizar la aplicacion antes de realizar el plan diario.
- Debe crear la planificación diaria antes de salir a campo.
- Los datos se guardan automáticamente si la app está configurada correctamente.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No puedo crear la planificación"
    - puede cerrar sesion y borrar datos y cache de la aplicacion (explica como borrar cache y datos de una aplicacion, y en caso que no pueda sugerirle seguir el tutorial dado en el menu).
   - Confirmar que la fecha sea la correcta (no se puede crear en fechas pasadas sin permiso).

2. "Se perdieron los datos / no se guardó"
   - revisar la conectividad si la conexion es mala sugerir hacer el plan diario en modo offline hasta tener buena coneccion.
   - Al regresar a zona con internet, sincronizar manualmente.
   - en caso de que la informacion que se perdio sea importante decirle al usuario que se comunique con el asesor para confirmar si el plan diario se subio o no.

3. "Necesito reabrir la planificación"
   - debe comunicarse con el asesor para poder realizar esta operación.

4. "La planificación no aparece en el listado"
   - Verificar que esté en la fecha correcta y en el formato adecuado (ft-ms-14 o 20).
   - Si es usuario operativo, solo verá sus propias planificaciones.
   - comunicarse con el asesor para revisar si el plan diario esta cargado.

REGLA CRÍTICA: Solo responda sobre Planificaciones de PREVEBSA. No mencione ATIPOP ni FaceID.`,

  prevebsa_3: `=== INSPECCIONES PREOPERACIONALES — PREVEBSA ===

FUNCIONAMIENTO NORMAL:
- Hay 4 formatos de inspección: VEHÍCULO, MOTO, EQUIPOS CRÍTICOS y HERRAMIENTAS Y EQUIPOS CRITICOS.
- Las inspecciones se asignan desde el plan diario.
- Debe completar todos los campos obligatorios antes de guardar.

- Las fotos se adjuntan dentro del mismo formulario de inspección.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No puedo crear la inspección"
   - Verificar que la inspección esté asignada en el plan diario.
   - Revisar que la fecha del plan diario sea la actual.

2. "No se guardan las fotos de la inspección"
   - revisar conectividad si la conectividad es mala la imagen puede que no se suba.
    - borrar cache y datos de la aplicacion (en caso que no sepa darle una guia y en caso que siga perdido darle la recomendacion de optener el tutorial del menu de tutoriales).

REGLA CRÍTICA: Solo responda sobre Inspecciones Preoperacionales de PREVEBSA. No mencione ATIPOP ni FaceID.`,

  prevebsa_4: `=== OBSERVACIONES — PREVEBSA ===

FUNCIONAMIENTO NORMAL:
- Las observaciones registran hallazgos en campo durante la jornada.
- Se deben asociar a una planificación activa del día.
- Incluyen descripción del hallazgo, nivel de riesgo y evidencia fotográfica.
- El supervisor revisa las observaciones al final del día.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No puedo registrar una observación"
   - Verificar que tenga una planificación activa y vigente.
   - Confirmar que esté en el horario de trabajo asignado.

2. "No se guarda la observación"
   - Verificar conexión a internet.
   - Si está en modo offline, sincronizar al regresar a zona con cobertura.
   - Completar todos los campos obligatorios antes de guardar.

3. "No aparecen mis observaciones en el sistema"
   - Verificar que la sincronización se haya completado.
   - El supervisor puede tardar algunos minutos en ver las observaciones actualizadas.
   - Si persiste, solicitar al asesor que revise desde el panel web.

4. "Error al adjuntar foto en la observación"
   - Verificar que la app tenga permisos de cámara y almacenamiento.
   - Intentar adjuntar la foto nuevamente desde la galería.

REGLA CRÍTICA: Solo responda sobre Observaciones de PREVEBSA. No mencione ATIPOP ni FaceID.`,

  prevebsa_5: `=== MÓDULO PROCESO — PREVEBSA ===

FUNCIONAMIENTO NORMAL:
- El Módulo Proceso gestiona envíos y seguimiento de información operativa.
- Permite visualizar el estado de los procesos registrados en campo.
- Se actualiza cuando los datos se sincronizan correctamente.
- Incluye registro de imágenes y documentos asociados al proceso.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No veo mis envíos en el módulo proceso"
   - Verificar que la sincronización se haya realizado correctamente.
   - Confirmar que esté consultando en la fecha correcta.
   - Si es usuario operativo, solo verá sus propios envíos.

2. "Las imágenes no cargan en el módulo proceso"
   - Verificar que las imágenes se hayan adjuntado correctamente en el formulario origen.
   - Revisar la conexión a internet.
   - Si las imágenes son muy pesadas, comprimirlas antes de adjuntar.

3. "El estado del proceso no se actualiza"
   - El estado se actualiza después de sincronizar.
   - Forzar sincronización manual desde el menú de Configuración.
   - Si persiste, el supervisor puede verificar desde el panel web.

4. "No puedo enviar información por el módulo proceso"
   - Verificar que tenga una planificación activa.
   - Confirmar que complete todos los campos obligatorios.
   - Revisar que tenga conexión a internet estable.

REGLA CRÍTICA: Solo responda sobre el Módulo Proceso de PREVEBSA. No mencione ATIPOP ni FaceID.`,

  prevebsa_6: `=== OTRO PROBLEMA — PREVEBSA ===

FUNCIONAMIENTO NORMAL:
- Esta opción cubre inconvenientes no listados en los demás módulos.
- El usuario debe describir detalladamente el problema para poder asistirle.
- Si el problema corresponde a otro módulo específico, se le indicará la sección correcta.

ERRORES TÍPICOS Y SOLUCIONES:
1. Problemas generales de funcionamiento
   - Cerrar y abrir la aplicación nuevamente.
   - Verificar que tenga la versión actualizada desde la tienda de aplicaciones (en caso de que no desinstalar e instalar la nueva, la ultima version se solucionaron varios problemas).
   
   2. Problemas de rendimiento o velocidad
   - Cerrar aplicaciones en segundo plano.
   - Liberar espacio de almacenamiento en el teléfono.
   - Reiniciar el dispositivo si la app se pone lenta.
   - Verificar que tenga la versión actualizada desde la tienda de aplicaciones (en caso de que no, desinstalar e instalar la nueva, la ultima version se solucionaron varios problemas).

3. Problemas de instalación o actualización
   - Descargar la app oficial desde Google Play Store o App Store.
   - Verificar que tenga espacio disponible para instalar.
   - Si la actualización falla, desinstalar y volver a instalar (sus datos se respaldan con la cuenta).

REGLA CRÍTICA: Solo responda sobre PREVEBSA. Si el problema no se puede resolver con esta información, indique al usuario que escriba *#* para hablar con un asesor. NO mencione ATIPOP ni FaceID.`,

  atipop_1: `=== INICIO DE SESIÓN — ATIPOP ===

FUNCIONAMIENTO NORMAL:
- ATIPOP permite 2 métodos de inicio: CORREO/CONTRASEÑA (SGA) o FACEID.
- Estos son flujos completamente distintos; debe identificar cuál usa el usuario.
- Si usa correo/contraseña, el acceso es mediante SGA (Sistema de Gestión de Accesos).
- Si usa FaceID, debe tener el registro biométrico previo completado.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No puedo ingresar con correo y contraseña (SGA)"
   - Verificar correo registrado y contraseña correctos.
   - Si olvida la contraseña, usar "Olvidé mi contraseña" (hay un tutorial disponible con el proceso explicado).

2. "FaceID no funciona / no me reconoce"
   - Verificar que tenga buena iluminación al escanear el rostro.
   - Limpiar la cámara frontal del teléfono.
   - Si el teléfono no tiene FaceID, usar correo y contraseña.

3. "No me llega el correo de recuperación"
   - Esperar entre 5 y 10 minutos.
   - Revisar spam, correo no deseado o filtros.
   - Confirmar que el correo registrado sea el institucional correcto.
   - Si persiste, contactar al administrador de TI.

4. "Cuenta bloqueada / usuario inactivo"
   - El administrador debe activar o desbloquear la cuenta desde el panel.
   - Si hay bloqueo por seguridad, esperar 15 minutos antes de reintentar.

REGLA CRÍTICA: Solo responda sobre Inicio de Sesión de ATIPOP. Si se consulta por PREVEBSA, indique que escriba *#* para hablar con un asesor.`,

  atipop_2: `=== MI CUENTA / DOCUMENTOS — ATIPOP ===

FUNCIONAMIENTO NORMAL:
- Mi Cuenta gestiona: perfil personal, carnet, documentos laborales y datos del vehículo.
- El carnet se descarga desde la app en formato digital.
- Los documentos (nómina, certificados) deben estar cargados por RRHH o administración.
- El vehículo asignado se muestra una vez configurado por el administrador.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No veo mi carnet"
   - Verificar que esté en la sección correcta: Mi Cuenta → Carnet.
   - Si aparece vacío, solicitar a RRHH que cargue el documento.
   - Actualizar la app a la última versión disponible.

2. "No veo mis documentos / nómina"
   - Los documentos son cargados por el área de RRHH o administración.
   - Si no aparecen, contactar a RRHH para que los suba al sistema.
   - Verificar que la cuenta esté vinculada al empleado correcto.

3. "Datos del vehículo incorrectos o faltantes"
   - Solo el administrador puede modificar los datos del vehículo asignado.
   - Solicitar al supervisor o administrador que actualice la información.
   - Verificar que el vehículo esté registrado en el sistema con la placa correcta.

4. "No puedo actualizar mi foto de perfil"
   - ATIPOP usa el registro biométrico (FaceID) como perfil principal.
   - La foto de perfil se captura durante el registro de FaceID.
   - Si necesita actualizar, debe volver a registrar FaceID.

REGLA CRÍTICA: Solo responda sobre Mi Cuenta y Documentos de ATIPOP. No mencione PREVEBSA ni módulos que no correspondan.`,

  atipop_3: `=== REPORTE EN RUTA — ATIPOP ===

FUNCIONAMIENTO NORMAL:
- El Reporte en Ruta registra la actividad diaria en campo.
- Se debe crear un reporte por día con las actividades realizadas.
- Incluye: horas de inicio y fin, ubicación GPS, novedades y evidencias.
- El supervisor revisa y aprueba los reportes al final del día.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No puedo crear el reporte en ruta"
   - Verificar que tenga una asignación de ruta activa.
   - Confirmar que esté dentro del horario de trabajo asignado.
   - Revisar que el GPS esté activado para registrar la ubicación.

2. "No se guarda el reporte"
   - Activar modo offline en Configuración antes de salir a campo.
   - Al regresar a zona con internet, sincronizar manualmente.
   - Completar todos los campos obligatorios antes de guardar.

3. "No aparecen las evidencias fotográficas"
   - Verificar que la app tenga permisos de cámara y almacenamiento.
   - Adjuntar las fotos dentro del formulario del reporte, no por separado.
   - Si las fotos son muy pesadas, comprimirlas antes de adjuntar.

4. "El reporte no se envía / no se sincroniza"
   - Forzar sincronización manual desde el menú principal.
   - Verificar conexión a internet estable.
   - Si persiste, el supervisor puede revisar desde el panel web.

REGLA CRÍTICA: Solo responda sobre Reporte en Ruta de ATIPOP. No mencione PREVEBSA ni FaceID a menos que se indique explícitamente.`,

  atipop_4: `=== SUPERVISIONES E INSPECCIONES — ATIPOP ===

FUNCIONAMIENTO NORMAL:
- Supervisiones e Inspecciones permiten registrar verificaciones en campo.
- Se basan en formatos predefinidos según el tipo de supervisión.
- Incluyen checklist de verificación, evidencias fotográficas y observaciones.
- El supervisor revisa los resultados y puede solicitar correctivos.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No puedo crear una supervisión"
   - Verificar que tenga el rol de supervisor o inspector asignado.
   - Confirmar que la supervisión esté programada o disponible para su zona.
   - Revisar que tenga conexión a internet al momento de crear.

2. "La inspección se cierra sola / no se guarda"
   - Guardar datos periódicamente mientras completa la inspección.
   - Si se cerró por timeout, el supervisor puede reabrirla.
   - Activar modo offline antes de salir a campo sin cobertura.

3. "No aparecen los formatos de inspección"
   - Verificar que el tipo de supervisión corresponda al formato correcto.
   - Solicitar al administrador que revise la configuración de formatos.
   - Actualizar la app para ver los formatos más recientes.

4. "No se adjuntan las fotos correctamente"
   - Verificar permisos de cámara y almacenamiento en el teléfono.
   - Adjuntar las fotos dentro del formulario de la inspección.
   - Reducir el peso de las imágenes si son muy grandes.

REGLA CRÍTICA: Solo responda sobre Supervisiones e Inspecciones de ATIPOP. No mencione PREVEBSA ni FaceID.`,

  atipop_5: `=== LECTURAS / EQUIPOS — ATIPOP ===

FUNCIONAMIENTO NORMAL:
- LECTURAS: Registro de valores de medidores, equipos de medición y QR.
- EQUIPOS: Gestión del historial, devolutivos y asignación de equipos.
- Las lecturas se toman en campo escaneando códigos QR o ingresando valores manualmente.
- Los equipos se consultan por serie, placa o código de barras.

ERRORES TÍPICOS Y SOLUCIONES:
1. "No puedo escanear el QR / código de barras"
   - Verificar que el código esté en buenas condiciones (no dañado).
   - Limpiar la cámara del teléfono y asegurar buena iluminación.
   - Si el QR no es legible, ingresar el número manualmente.

2. "El equipo no aparece en el listado"
   - Verificar que el equipo esté registrado en el sistema.
   - Confirmar que esté asignado a la zona o ruta correcta.
   - Solicitar al administrador que cargue el equipo si es nuevo.

3. "No se guarda la lectura del medidor"
   - Verificar que ingrese todos los campos obligatorios.
   - Confirmar que el medidor esté activo y no dado de baja.
   - Activar modo offline y sincronizar después.

4. "Error al registrar devolutivo de equipo"
   - Verificar que el equipo esté físicamente disponible para devolución.
   - Confirmar que el receptor esté registrado en el sistema.
   - Si el equipo está dañado, marcarlo como "No funcional" antes de devolver.

REGLA CRÍTICA: Solo responda sobre Lecturas y Equipos de ATIPOP. No mencione PREVEBSA ni FaceID.`,

  atipop_6: `=== SINCRONIZACIÓN — ATIPOP ===

FUNCIONAMIENTO NORMAL:
- La sincronización envía datos guardados localmente al servidor central.
- Se debe sincronizar al final del día o cuando haya conexión estable.
- Si hay conflictos, el sistema prioriza la información más reciente.
- La barra de sincronización muestra el estado: pendiente, sincronizando, completado o error.

ERRORES TÍPICOS Y SOLUCIONES:
1. "La app no sincroniza / se queda pegada"
   - Forzar cierre y abrir la aplicación nuevamente.
   - Verificar que tenga conexión a internet estable (WiFi o datos móviles).
   - Ir a Configuración → Sincronización → Sincronizar ahora.

2. "Datos desactualizados o sin cargar"
   - Forzar sincronización manual desde Configuración.
   - Verificar que la fecha y hora del teléfono sean correctas (sincronizadas automáticamente).
   - Si hay muchos datos pendientes, la sincronización puede tardar varios minutos.

3. "Error de sincronización / servidor no disponible"
   - Verificar que el servidor esté disponible (consultar con el administrador).
   - Reintentar la sincronización después de 10 minutos.
   - Si persiste, contactar al equipo de soporte de ATI.

4. "Se perdieron datos después de sincronizar"
   - No cerrar la app mientras se está sincronizando.
   - Esperar a que la sincronización muestre "Completado".
   - Si los datos no aparecen, verificar desde el panel web si se subieron correctamente.

REGLA CRÍTICA: Solo responda sobre Sincronización de ATIPOP. No mencione PREVEBSA ni FaceID.`,

  atipop_7: `=== CONFIGURACIÓN / GPS / ALERTAS — ATIPOP ===

FUNCIONAMIENTO NORMAL:
- Configuración incluye: GPS, vibración, notificaciones, modo offline y cuenta.
- El GPS debe estar activado para registrar ubicación en reportes e inspecciones.
- Las alertas GPS avisan si se aleja de la zona asignada.
- En modo offline, los datos se guardan localmente hasta sincronizar.

ERRORES TÍPICOS Y SOLUCIONES:
1. "El GPS no funciona / no registra ubicación"
   - Activar GPS en los ajustes del teléfono (no solo en la app).
   - Salir a un espacio abierto para obtener señal satelital.
   - Reiniciar el teléfono si el GPS sigue sin responder.
   - Verificar que la app tenga permiso de ubicación en todo momento.

2. "No llegan las alertas / notificaciones"
   - Verificar Configuración → Notificaciones en ATIPOP.
   - En ajustes del teléfono: permitir notificaciones para ATIPOP.
   - Revisar que no esté en modo "No molestar" o "No interrumpir".
   - Confirmar que las alertas GPS estén activadas en Configuración.

3. "La app se queda pegada en segundo plano"
   - En Configuración → Batería: permitir uso en segundo plano.
   - En iOS: Ajustes → General → Actualización en segundo plano → ATIPOP → Permitir.
   - En Android: Ajustes → Aplicaciones → ATIPOP → Batería → Sin restricciones.

4. "Problemas con la distancia GPS / geocercas"
   - Verificar que la zona asignada esté correctamente configurada en el sistema.
   - Confirmar que el GPS tenga precisión de al menos 10 metros.
   - Si la alerta se activa incorrectamente, contactar al administrador para ajustar la geocerca.

REGLA CRÍTICA: Solo responda sobre Configuración, GPS y Alertas de ATIPOP. No mencione PREVEBSA ni FaceID.`,

  atipop_8: `=== OTRO PROBLEMA — ATIPOP ===

FUNCIONAMIENTO NORMAL:
- Esta opción cubre inconvenientes no listados en los demás módulos de ATIPOP.
- Describa detalladamente el problema para poder asistirle.
- Si el problema corresponde a otro módulo específico, se le indicará la sección correcta.

ERRORES TÍPICOS Y SOLUCIONES:
1. Problemas generales de funcionamiento
   - Cerrar y abrir la aplicación nuevamente.
   - Verificar que tenga la versión actualizada desde la tienda de aplicaciones.
   - Revisar que el teléfono cumpla con los requisitos mínimos del sistema.

2. Problemas de rendimiento o velocidad
   - Cerrar aplicaciones en segundo plano.
   - Liberar espacio de almacenamiento en el teléfono.
   - Reiniciar el dispositivo si la app se pone lenta o se cuelga.

3. Problemas de instalación o actualización
   - Descargar la app oficial desde Google Play Store o App Store.
   - Verificar que tenga espacio disponible para instalar.
   - Si la actualización falla, desinstalar y volver a instalar (los datos se respaldan con la cuenta).

4. Problemas con la cuenta o acceso general
   - Verificar que el correo y contraseña sean los correctos.
   - Si olvidó la contraseña, usar la opción de recuperación en SGA.
   - Si la cuenta está bloqueada, esperar 15 minutos o contactar al administrador.

REGLA CRÍTICA: Solo responda sobre ATIPOP. Si el problema no se puede resolver con esta información, indique al usuario que escriba *#* para hablar con un asesor. NO mencione PREVEBSA.`,
};

module.exports = { CONTEXTOS };

// ===========================================================================
//  CONFIGURACIÓN DE LA ENCUESTA (WhatsApp Flows)
//  ---------------------------------------------------------------------------
//
//  Requisitos previos (PENDIENTE DE IMPLEMENTACIÓN en Meta):
//    1. Crear el Flow en WhatsApp Business Manager (categoría SURVEY).
//    2. Publicarlo y copiar el FLOW_ID.
//    3. Definir WHATSAPP_FLOW_ID en tu .env (o pegarlo en `flowId` abajo).
//
//  Tipos de pregunta soportados:
//    "text"      -> texto libre        { id, type, title, required, placeholder? }
//    "email"     -> correo electrónico { id, type, title, required }
//    "phone"     -> teléfono            { id, type, title, required }
//    "number"    -> número             { id, type, title, required }
//    "radio"     -> opción única       { id, type, title, required, options: [...] }
//    "dropdown"  -> lista desplegable  { id, type, title, required, options: [...] }
//    "checkbox"  -> varias opciones    { id, type, title, required, options: [...] }
//    "rating"    -> calificación 1-5   { id, type, title, required }
//    "date"      -> fecha              { id, type, title, required }
//
//  Reglas:
//    - `id`      : clave única sin espacios (se usa para guardar la respuesta).
//    - `required`: true = obligatoria, false = opcional.
//    - `options` : obligatorio solo para radio/dropdown/checkbox.
// ===========================================================================

module.exports = {
  surveyName: "datos para soporte",
  introText: "antes de contactarte con un asesor necesitamos que contestes estas preguntas",
  ctaText: "Responder encuesta",
  flowId: process.env.WHATSAPP_FLOW_ID || "1451317930096157",
  flowToken: "survey-ati",
  thankYouMessage: "¡Gracias! Un asesor le contactará en breve.",
  questions: [
    {
      id: "nombre",
      type: "text",
      title: "¿Cuál es su nombre completo?",
      required: true,
    },
    {
      id: "aplicativo",
      type: "dropdown",
      title: "¿Qué aplicativo le falla?",
      required: true,
      options: ["PREVEBSA", "ATIPOP", "Otro"],
    },
    {
      id: "version",
      type: "text",
      title: "¿Qué versión tiene instalada?",
      required: true,
      placeholder: "Ej: 2.1.5",
    },
    {
      id: "seccion",
      type: "text",
      title: "¿En qué sección le falla?",
      required: true,
      placeholder: "Ej: Plan Diario, Login, Sincronización...",
    },
    {
      id: "accion",
      type: "text",
      title: "¿En qué acción le falla?",
      required: true,
      placeholder: "Ej: Al enviar, al guardar, al abrir...",
    },
    {
      id: "error",
      type: "text",
      title: "Describa el error sucedido",
      required: true,
      placeholder: "Cuénteme qué pasó...",
    },
  ],
};

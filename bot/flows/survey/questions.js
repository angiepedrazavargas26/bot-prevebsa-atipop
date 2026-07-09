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
  // Nombre de la encuesta (aparece como título de la pantalla del Flow).
  surveyName: "datos para soporte",

  // Texto que acompaña el botón que abre la encuesta.
  introText:
    "antes de contactarte con un asesor nesecitamos que contestes unas cosas antes",

  // Texto del botón que el usuario toca para abrir el formulario.
  ctaText: "Responder encuesta",

  // ID del Flow publicado en Meta. Toma prioridad la variable de entorno.
  flowId: process.env.WHATSAPP_FLOW_ID || "",

  // Token para identificar esta instancia de la encuesta.
  flowToken: "survey-ati",

  // Mensaje que se envía al usuario al completar la encuesta.
  thankYouMessage: "¡Gracias por tu respuesta!",

  // -------------------------------------------------------------------------
  //  PREGUNTAS — completa / modifica según necesites.
  // -------------------------------------------------------------------------
  questions: [
    {
      id: "calificacion",
      type: "rating",
      title: "¿Cómo calificarías la atención recibida?",
      required: true,
    },
    {
      id: "recomienda",
      type: "radio",
      title: "¿Recomendarías nuestro soporte técnico?",
      required: true,
      options: ["Sí", "No", "Tal vez"],
    },
    {
      id: "canal",
      type: "dropdown",
      title: "¿Desde qué aplicativo nos contactaste?",
      required: false,
      options: ["PREVEBSA", "ATIPOP", "Otro"],
    },
    {
      id: "comentarios",
      type: "text",
      title: "Comentarios adicionales (opcional)",
      required: false,
      placeholder: "Escribe aquí tu comentario",
    },
  ],
};

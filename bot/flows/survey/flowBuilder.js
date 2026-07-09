// bot/flows/survey/flowBuilder.js
// Construye el JSON de un WhatsApp Flow (versión 2.1) a partir de la
// configuración de preguntas definida en questions.js. No requiere edición.

const FLOW_VERSION = "2.1";
const SCREEN_ID = "SURVEY_SCREEN";

function dataTypeFor(type) {
  if (type === "number" || type === "rating") return "number";
  if (type === "date") return "date";
  return "string";
}

function buildComponent(q) {
  switch (q.type) {
    case "text":
    case "email":
    case "phone":
    case "number":
      return {
        type: "TextInput",
        name: q.id,
        label: q.title,
        "input-type": q.type === "text" ? "text" : q.type,
        ...(q.placeholder ? { placeholder: q.placeholder } : {}),
      };
    case "radio":
    case "dropdown":
      return {
        type: q.type === "radio" ? "RadioButtonsGroup" : "Dropdown",
        name: q.id,
        label: q.title,
        "data-source": {
          type: "static",
          items: (q.options || []).map((o) => ({ id: String(o), title: String(o) })),
        },
      };
    case "checkbox":
      return {
        type: "CheckboxGroup",
        name: q.id,
        label: q.title,
        "data-source": {
          type: "static",
          items: (q.options || []).map((o) => ({ id: String(o), title: String(o) })),
        },
      };
    case "rating":
      return { type: "Rating", name: q.id, label: q.title, max: 5 };
    case "date":
      return { type: "DateTimePicker", name: q.id, label: q.title, mode: "date" };
    default:
      return {
        type: "TextInput",
        name: q.id,
        label: q.title,
        "input-type": "text",
      };
  }
}

// Genera el objeto Flow JSON completo.
function buildSurveyFlow(config) {
  const data = {};
  const components = [];
  const children = [];

  components.push({
    type: "TextHeading",
    name: "heading",
    text: config.surveyName || "Encuesta",
  });
  children.push("heading");

  for (const q of config.questions || []) {
    const comp = buildComponent(q);
    data[q.id] = {
      type: dataTypeFor(q.type),
      ...(q.required === false ? {} : { required: true }),
    };
    components.push(comp);
    children.push(comp.name);
  }

  components.push({ type: "Footer", name: "submit", label: "Enviar" });
  children.push("submit");

  return {
    version: FLOW_VERSION,
    screens: [
      {
        id: SCREEN_ID,
        title: config.surveyName || "Encuesta",
        data,
        layout: {
          type: "SingleColumnLayout",
          children,
        },
        components,
        terminal: true,
        success: true,
      },
    ],
  };
}

module.exports = { buildSurveyFlow, SCREEN_ID };

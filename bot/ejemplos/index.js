const ejemplos = {
  pasos: [
    {
      question: "version",
      text: "si no sabe cual es la version del aplicativo por favor revise las siguientes imagenes",
    },
  ],
  error: [
    {
      question: "modulo",
      text: "Ejem: inspecciones, diagnosticos, plan diarios, autorizacion, etc.",
    },
    {
      question: "accion",
      text: "Ejem: 'estaba subiendo el unifilar', 'solicitando autorizacion'",
    },
    { question: "error", text: "'escriba detalladamente el error sucedido'" },
  ],
  peticion: [
    {
      question: "ayuda",
      text: "Ejem: 'nesecito reabrir el plan diario', 'necesito cambiar el municipio'",
    },
    {
      question: "razon",
      text: "EJem: 'lo nesecito reabrir por que me falto un trabajador', 'tengo que cambiar de municipio debido a una orden' ",
    },
  ],
};

module.exports = { ejemplos };

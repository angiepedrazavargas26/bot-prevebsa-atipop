// bot/services/claude.js

const HERRAMIENTA_REPORTAR_ERROR = {
  name: "reportar_error_nuevo",
  description:
    "Reporta un error nuevo o problema NO cubierto por el contexto actual del módulo. Usa esta herramienta SOLO cuando el usuario mencione un inconveniente que claramente no está descrito en el contexto proporcionado.",
  input_schema: {
    type: "object",
    properties: {
      descripcion: {
        type: "string",
        description:
          "Descripción breve y específica del error o problema nuevo detectado",
      },
    },
    required: ["descripcion"],
  },
};

function construirSystemPrompt(appNombre, contexto, nombre) {
  return `Usted es el asistente de soporte técnico de ATI para el aplicativo ${appNombre}.

═══════════════════════════════════════════════════════════════
CONTEXTO COMPLETO DEL MÓDULO ACTUAL (SOLO PUEDE USAR ESTA INFORMACIÓN):
═══════════════════════════════════════════════════════════════
${contexto || "No hay contexto específico."}

═══════════════════════════════════════════════════════════════
REGLAS ESTRICTAS — DEBE CUMPLIRLAS TODAS SIN EXCEPCIÓN:
═══════════════════════════════════════════════════════════════

1. **SOLO puede responder sobre el módulo actual indicado arriba**.
   - Si el usuario pregunta sobre OTRO módulo, otro aplicativo (PREVEBSA vs ATIPOP), o funcionalidades que NO estén en el contexto, use la herramienta 'reportar_error_nuevo' con una descripción breve del problema.
   - Después de usar la herramienta, responda al usuario: "Este tipo de inconveniente requiere verificación especializada. Un asesor le contactará pronto. Si necesita ayuda ahora, escriba *#* para hablar con un asesor."

2. **NUNCA invente información** que no esté explícitamente en el contexto.
   - Si el contexto no menciona una funcionalidad o solución, no la mencione.
   - Si no sabe la respuesta con certeza, dígalo claramente y ofrezca escalar con un asesor.

3. Sea directo y conciso — use pasos numerados cuando explique procedimientos.

4. Use "usted" en todo momento. Tono formal y cordial.

5. FORMATO WHATSAPP:
   - Para NEGRITA use un solo asterisco: *texto*
   - NUNCA use doble asterisco (**), ni markdown avanzado (##, \`, etc.)
   - Separe párrafos con líneas en blanco

6. Al final de CADA respuesta incluya siempre: "_Escriba *#* para hablar con un asesor_"

7. ${nombre ? `Nombre del usuario: ${nombre}` : ""}`;
}

async function askClaude(userMessage, history, nombre, contexto, appActual) {
  const appNombre =
    appActual === "PREVEBSA"
      ? "PREVEBSA (seguridad y salud en el trabajo - HSE)"
      : appActual === "ATIPOP"
        ? "ATIPOP (gestión de subestaciones eléctricas)"
        : "ATIPOP o PREVEBSA";

  const systemPrompt = construirSystemPrompt(appNombre, contexto, nombre);

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: systemPrompt,
      messages,
      tools: [HERRAMIENTA_REPORTAR_ERROR],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));

  let text = "";
  const toolCalls = [];

  if (data.stop_reason === "tool_use" && data.content) {
    for (const block of data.content) {
      if (block.type === "tool_use") {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input,
        });
      } else if (block.type === "text") {
        text += block.text;
      }
    }
  } else if (data.content && data.content[0] && data.content[0].type === "text") {
    text = data.content[0].text;
  }

  text = text
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/__(.+?)__/g, "_$1_")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

  return { text, toolCalls };
}

module.exports = { askClaude, HERRAMIENTA_REPORTAR_ERROR };


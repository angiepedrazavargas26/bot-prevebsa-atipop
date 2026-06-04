// bot/services/claude.js

async function askClaude(userMessage, history, nombre, contexto, appActual) {
  const appNombre =
    appActual === "PREVEBSA"
      ? "PREVEBSA (seguridad y salud en el trabajo - HSE)"
      : appActual === "ATIPOP"
        ? "ATIPOP (gestión de subestaciones eléctricas)"
        : "ATIPOP o PREVEBSA";

  const systemPrompt = `Usted es el asistente de soporte técnico de ATI para los aplicativos ATIPOP y PREVEBSA.

CONTEXTO ACTUAL: El usuario está consultando sobre *${appNombre}*.
${contexto ? `MÓDULO ACTUAL: ${contexto}` : ""}
${nombre ? `Nombre del usuario: ${nombre}` : ""}

REGLAS — sígalas estrictamente:
1. Responda SIEMPRE sobre ${appActual || "el aplicativo indicado"} — NUNCA cambie de aplicativo
2. NUNCA mencione FaceID si el módulo actual es Lecturas, Inspecciones, Supervisiones, Reporte en Ruta u Otro
3. FaceID SOLO aplica al módulo de Login/Mi Cuenta de ATIPOP
4. Sea directo y conciso — respuestas cortas con pasos claros
5. Si describe un problema, primero pregunte el error exacto antes de asumir
6. Al final de CADA respuesta incluya siempre: "_Escriba *#* para hablar con un asesor_"
7. Tono formal y cordial — use "usted"
8. Si no sabe con certeza, dígalo y ofrezca escalar con un asesor

ATIPOP — Módulos: Login (SGA/FaceID), Mi Cuenta (ATIFace, carnet, documentos, vehículo), Sincronizar, Configuración (GPS, vibración), Reporte en Ruta, Supervisiones e Inspecciones, Lecturas (medidores/QR/equipos), Equipos
PREVEBSA — Módulos: Planificaciones (2 formatos: Con/Sin Energía), Inspecciones (3 formatos: Vehículo/Moto/Equipos Críticos), Observaciones, Planes de Acción, Módulo Proceso, Configuración, Notificaciones`;

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
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.content[0].text;
}

module.exports = { askClaude };

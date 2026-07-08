// bot/services/whatsapp.js

const OPCION_ASESOR = "\n\n_Escriba *#* para hablar con un asesor_";

function sanitizeInteractiveRows(rows) {
  return rows.map((row) => ({
    id: String(row.id || "").trim(),
    title: String(row.title || "")
      .replace(/\s+/g, " ")
      .slice(0, 24)
      .trim(),
    description:
      row.description !== undefined
        ? String(row.description).replace(/\s+/g, " ").slice(0, 72).trim()
        : undefined,
  }));
}

async function sendWhatsApp(to, message) {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    },
  );
  return response.json();
}

async function sendInteractiveList(to, bodyText, buttonText, rows, footerText) {
  const sanitizedRows = sanitizeInteractiveRows(rows);
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      action: {
        button: buttonText,
        sections: [
          {
            title: "Opciones",
            rows: sanitizedRows,
          },
        ],
      },
      footer: footerText ? { text: footerText } : undefined,
    },
  };

  let lastError;
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        lastError = new Error(
          data.error?.message || "WhatsApp interactive list failed",
        );
        if (res.status === 429) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }
        throw lastError;
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }

  console.error("sendInteractiveList error (fallback a texto):", lastError?.message);
  const text = `${bodyText}\n\n${sanitizedRows
    .map(
      (row) =>
        `${row.id}. ${row.title}${row.description ? "\n" + row.description : ""}`,
    )
    .join("\n\n")}`;
  await sendWhatsApp(to, text);
}

async function sendVideoMessage(to, video) {
  if (!video) return;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "video",
          video: { link: video.url, caption: video.titulo },
        }),
      },
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
  } catch {
    const fileId = video.url.split("id=")[1];
    await sendWhatsApp(
      to,
      `*${video.titulo}*\n\n› Ver tutorial: https://drive.google.com/file/d/${fileId}/view`,
    );
  }
}

async function reenviarMediaAlAsesor(agentePhone, clientePhone, message) {
  const tipo = message.type;
  const mediaObj = message[tipo];
  if (!mediaObj) return;

  const tipoLabel =
    {
      image: "imagen",
      audio: "audio",
      video: "video",
      document: "documento",
      sticker: "sticker",
    }[tipo] || tipo;

  try {
    await sendWhatsApp(
      agentePhone,
      `📎 *Usuario +${clientePhone}* envió ${tipoLabel === "imagen" ? "una" : "un"} *${tipoLabel}*:`,
    );

    const body = {
      messaging_product: "whatsapp",
      to: agentePhone,
      type: tipo,
    };

    body[tipo] = { id: mediaObj.id };
    if (mediaObj.caption && tipo !== "audio" && tipo !== "sticker") {
      body[tipo].caption = mediaObj.caption;
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();

    if (data.error) {
      console.error("Error reenviando media:", data.error.message);
      await sendWhatsApp(
        agentePhone,
        `⚠️ No se pudo reenviar el ${tipoLabel} automáticamente. Revise el chat del usuario +${clientePhone} directamente en WhatsApp.`,
      );
    }
  } catch (e) {
    console.error("reenviarMediaAlAsesor error:", e.message);
    try {
      await sendWhatsApp(
        agentePhone,
        `⚠️ Error al reenviar el ${tipoLabel} del usuario +${clientePhone}. Revíselo directamente en WhatsApp.`,
      );
    } catch (_) {}
  }
}

module.exports = {
  sendWhatsApp,
  sendInteractiveList,
  sendVideoMessage,
  reenviarMediaAlAsesor,
  OPCION_ASESOR,
};

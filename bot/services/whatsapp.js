// bot/services/whatsapp.js

const OPCION_ASESOR = "\n\n_Escriba *#* para hablar con un asesor_";

const WHATSAPP_API = "https://graph.facebook.com/v19.0";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function messagesUrl() {
  return `${WHATSAPP_API}/${process.env.PHONE_NUMBER_ID}/messages`;
}

const LIMITES_MB = { image: 5, audio: 16, video: 16, document: 100, sticker: 0.1 };
const LIMITES = Object.fromEntries(
  Object.entries(LIMITES_MB).map(([k, v]) => [k, Math.round(v * 1024 * 1024)]),
);

function formatoTamano(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + " KB";
  return bytes + " B";
}

async function descargarDesdeDrive(url) {
  const extraerId = (u) => (u.match(/id=([^&]+)/) || [])[1];

  const intentar = async (u) => {
    const res = await fetch(u, { redirect: "follow" });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || contentType.includes("text/html")) return { html: await res.text() };
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, mime: contentType.split(";")[0].trim() };
  };

  let resultado = await intentar(url);
  if (resultado.html) {
    const confirm = (resultado.html.match(/confirm=([0-9A-Za-z_-]+)/) || [])[1] || "t";
    const id = extraerId(url);
    if (!id) throw new Error("No se pudo identificar el archivo de Drive");
    resultado = await intentar(
      `https://drive.google.com/uc?export=download&id=${id}&confirm=${confirm}`,
    );
    if (resultado.html) throw new Error("Drive bloqueó la descarga del archivo");
  }

  return resultado;
}

async function descargarDesdeMediaId(mediaId) {
  const infoRes = await fetch(
    `${WHATSAPP_API}/${mediaId}?phone_number_id=${process.env.PHONE_NUMBER_ID}&access_token=${process.env.WHATSAPP_TOKEN}`,
  );
  const info = await infoRes.json();
  if (info.error) throw new Error(info.error.message);

  const dlRes = await fetch(info.url);
  if (!dlRes.ok) throw new Error("No se pudo descargar el medio desde WhatsApp");
  const buffer = Buffer.from(await dlRes.arrayBuffer());
  const mime =
    info.mime_type ||
    (dlRes.headers.get("content-type") || "").split(";")[0].trim() ||
    "";
  return { buffer, mime };
}

async function subirMedia(buffer, mime) {
  const initRes = await fetch(`${WHATSAPP_API}/${process.env.PHONE_NUMBER_ID}/media`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      type: mime,
    }),
  });
  const initData = await initRes.json();
  if (initData.error) throw new Error(initData.error.message);

  const uploadRes = await fetch(initData.url, {
    method: "POST",
    headers: { "Content-Type": mime },
    body: buffer,
  });
  const uploadData = await uploadRes.json();
  if (uploadData.error) throw new Error(uploadData.error.message);
  return uploadData.id;
}

async function enviarMediaPorId(to, tipo, mediaId, caption, filename) {
  const body = {
    messaging_product: "whatsapp",
    to,
    type: tipo,
  };
  body[tipo] = { id: mediaId };
  if (filename && tipo === "document") body[tipo].filename = filename;
  if (caption && tipo !== "audio" && tipo !== "sticker") {
    body[tipo].caption = caption;
  }

  const res = await fetch(messagesUrl(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

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
  const response = await fetch(messagesUrl(), {
    method: "POST",
    headers: authHeaders(),
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
      const res = await fetch(messagesUrl(), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
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
    const { buffer, mime } = await descargarDesdeDrive(video.url);
    const mediaMime = mime && mime.startsWith("video/") ? mime : "video/mp4";
    const mediaId = await subirMedia(buffer, mediaMime);
    await enviarMediaPorId(to, "video", mediaId, video.titulo);
  } catch (e) {
    console.error("sendVideoMessage error:", e.message);
    const fileId = video.url.split("id=")[1];
    await sendWhatsApp(
      to,
      `*${video.titulo}*\n\n› Ver tutorial: https://drive.google.com/file/d/${fileId}/view`,
    );
  }
}

async function reenviarMediaA(destinoPhone, message) {
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
    const { buffer, mime } = await descargarDesdeMediaId(mediaObj.id);

    const limite = LIMITES[tipo];
    if (limite && buffer.length > limite) {
      await sendWhatsApp(
        destinoPhone,
        `⚠️ El ${tipoLabel} recibido (${formatoTamano(buffer.length)}) supera el límite de WhatsApp para este tipo (máx. ${LIMITES_MB[tipo]} MB). Pida al asesor que lo envíe por otro medio.`,
      );
      return;
    }

    const mediaId = await subirMedia(buffer, mime);
    await enviarMediaPorId(
      destinoPhone,
      tipo,
      mediaId,
      mediaObj.caption,
      mediaObj.filename,
    );
  } catch (e) {
    console.error("reenviarMediaA error:", e.message);
    try {
      await sendWhatsApp(
        destinoPhone,
        `⚠️ No se pudo reenviar el ${tipoLabel} del asesor (${e.message}).`,
      );
    } catch (_) {}
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

    const { buffer, mime } = await descargarDesdeMediaId(mediaObj.id);

    const limite = LIMITES[tipo];
    if (limite && buffer.length > limite) {
      await sendWhatsApp(
        agentePhone,
        `⚠️ El ${tipoLabel} del usuario +${clientePhone} (${formatoTamano(buffer.length)}) supera el límite de WhatsApp (máx. ${LIMITES_MB[tipo]} MB) y no pudo reenviarse.`,
      );
      return;
    }

    const mediaId = await subirMedia(buffer, mime);
    await enviarMediaPorId(
      agentePhone,
      tipo,
      mediaId,
      mediaObj.caption,
      mediaObj.filename,
    );
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
  reenviarMediaA,
  OPCION_ASESOR,
};

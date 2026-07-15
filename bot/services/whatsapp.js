// bot/services/whatsapp.js

const OPCION_ASESOR = "\n\n_Escriba *#* para hablar con un asesor_";

const MENSAJE_ERROR_USUARIO =
  "⚠️ Ocurrió un problema técnico al procesar tu mensaje. Nuestro equipo ya está trabajando para solucionarlo pronto. Por favor, intenta de nuevo en unos minutos.";

const WHATSAPP_API = "https://graph.facebook.com/v19.0";

const FFMPEG_PATH =
  "C:\\Users\\carlos\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.2-full_build\\bin\\ffmpeg.exe";

const ENABLE_VIDEO_COMPRESSION = process.env.ENABLE_VIDEO_COMPRESSION === "true";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function messagesUrl() {
  return `${WHATSAPP_API}/${process.env.PHONE_NUMBER_ID}/messages`;
}

const TIPOS_MEDIA = new Set(["image", "audio", "video", "document", "sticker"]);

const EXT_MIME = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/zip": "zip",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "video/mp4": "mp4",
};

function nombreArchivoSeguro(filename, mime) {
  let nombre = String(filename || "archivo")
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, "_")
    .trim();
  if (!nombre) nombre = "archivo";
  const extActual = (nombre.split(".").pop() || "").toLowerCase();
  const extEsperada = EXT_MIME[mime] || "";
  const sinExtension = nombre.replace(/\.[^.]+$/, "");
  if (
    !extActual ||
    (extEsperada && extActual !== extEsperada && extActual.length > 5)
  ) {
    nombre = `${sinExtension}.${extEsperada || "bin"}`;
  }
  if (nombre.length > 240) nombre = nombre.slice(0, 240);
  return nombre;
}

const DEFAULT_TIMEOUT = 120_000;

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error(
        `La solicitud a ${new URL(url).hostname} excedió el tiempo límite (${timeout / 1000}s)`,
      );
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function retryFetch(url, options, timeout, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, timeout);
      return res;
    } catch (e) {
      lastError = e;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }
  throw lastError;
}

async function descargarDesdeDrive(url) {
  const extraerId = (u) => (u.match(/id=([^&]+)/) || [])[1];

  const intentar = async (u) => {
    const res = await fetchWithTimeout(u, { redirect: "follow" });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || contentType.includes("text/html"))
      return { html: await res.text() };
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, mime: contentType.split(";")[0].trim() };
  };

  let resultado = await intentar(url);
  if (resultado.html) {
    const confirm =
      (resultado.html.match(/confirm=([0-9A-Za-z_-]+)/) || [])[1] || "t";
    const id = extraerId(url);
    if (!id) throw new Error("No se pudo identificar el archivo de Drive");
    resultado = await intentar(
      `https://drive.google.com/uc?export=download&id=${id}&confirm=${confirm}`,
    );
    if (resultado.html)
      throw new Error("Drive bloqueó la descarga del archivo");
  }

  return resultado;
}

async function infoMedia(mediaId) {
  const infoRes = await fetchWithTimeout(
    `${WHATSAPP_API}/${mediaId}?phone_number_id=${process.env.PHONE_NUMBER_ID}&access_token=${process.env.WHATSAPP_TOKEN}`,
  );
  const info = await infoRes.json();
  if (info.error) throw new Error(info.error.message);
  return info;
}

async function descargarDesdeMediaId(mediaId) {
  const info = await infoMedia(mediaId);
  const dlRes = await fetchWithTimeout(info.url, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
  });
  if (!dlRes.ok)
    throw new Error("No se pudo descargar el medio desde WhatsApp");
  const buffer = Buffer.from(await dlRes.arrayBuffer());
  const mime =
    info.mime_type ||
    (dlRes.headers.get("content-type") || "").split(";")[0].trim() ||
    "";
  return { buffer, mime };
}

async function subirMedia(buffer, mime, filename) {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", mime);
  form.append("file", new Blob([buffer], { type: mime }), filename || "media");
  const res = await fetchWithTimeout(
    `${WHATSAPP_API}/${process.env.PHONE_NUMBER_ID}/media`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      body: form,
    },
  );
  const data = await res.json();
  if (data.error)
    throw new Error(
      `${data.error.message} ${JSON.stringify(data.error.error_data || data.error)}`,
    );
  return data.id;
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

  const res = await fetchWithTimeout(messagesUrl(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error)
    throw new Error(
      `${data.error.message} ${JSON.stringify(data.error.error_data || data.error)}`,
    );
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
  const response = await fetchWithTimeout(messagesUrl(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });
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
      const res = await fetchWithTimeout(messagesUrl(), {
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

  console.error(
    "sendInteractiveList error (fallback a texto):",
    lastError?.message,
  );
  const text = `${bodyText}\n\n${sanitizedRows
    .map(
      (row) =>
        `${row.id}. ${row.title}${row.description ? "\n" + row.description : ""}`,
    )
    .join("\n\n")}`;
  await sendWhatsApp(to, text);
}

async function subirMediaStream(stream, mime, filename, size) {
  const boundary = "----BotATI" + Date.now().toString(36);
  const enc = new TextEncoder();
  const preamble = enc.encode(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="messaging_product"\r\n\r\nwhatsapp\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="type"\r\n\r\n${mime}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: ${mime}\r\n\r\n`,
  );
  const closing = enc.encode(`\r\n--${boundary}--\r\n`);

  const body = new ReadableStream({
    async start(controller) {
      controller.enqueue(preamble);
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } finally {
        controller.enqueue(closing);
        controller.close();
        try {
          await reader.cancel();
        } catch (_) {}
      }
    },
  });

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
  };
  if (size > 0) {
    headers["Content-Length"] = String(size + preamble.length + closing.length);
  }

  const res = await fetchWithTimeout(
    `${WHATSAPP_API}/${process.env.PHONE_NUMBER_ID}/media`,
    { method: "POST", headers, body, duplex: "half" },
  );
  const data = await res.json();
  if (data.error) {
    throw new Error(
      `${data.error.message} ${JSON.stringify(data.error.error_data || data.error)}`,
    );
  }
  return data.id;
}

async function obtenerStreamDrive(url) {
  const res = await fetchWithTimeout(url, { redirect: "follow" }, 120_000);
  const contentType = res.headers.get("content-type") || "";
  if (res.ok && !contentType.includes("text/html")) {
    const size = Number(res.headers.get("content-length")) || 0;
    return {
      stream: res.body,
      size,
      mime: contentType.split(";")[0].trim(),
    };
  }

  const html = await res.text();
  if (html.includes("confirm=")) {
    const confirm = (html.match(/confirm=([0-9A-Za-z_-]+)/) || [])[1] || "t";
    const id = url.split("id=")[1];
    const retryRes = await fetchWithTimeout(
      `https://drive.google.com/uc?export=download&id=${id}&confirm=${confirm}`,
      { redirect: "follow" },
      120_000,
    );
    const retryContentType = retryRes.headers.get("content-type") || "";
    if (!retryRes.ok || retryContentType.includes("text/html")) {
      throw new Error("Drive bloqueó la descarga del archivo");
    }
    const size = Number(retryRes.headers.get("content-length")) || 0;
    return {
      stream: retryRes.body,
      size,
      mime: retryContentType.split(";")[0].trim(),
    };
  }

  throw new Error("Drive bloqueó la descarga del archivo");
}

async function comprimirVideo(buffer, mime) {
  const fs = await import("fs");
  const { execSync } = await import("child_process");
  const tmpInput = `C:\\Users\\carlos\\AppData\\Local\\Temp\\kilo\\ffmpeg\\input_${Date.now()}.mp4`;
  const tmpOutput = `C:\\Users\\carlos\\AppData\\Local\\Temp\\kilo\\ffmpeg\\output_${Date.now()}.mp4`;
  fs.writeFileSync(tmpInput, buffer);
  try {
    execSync(
      `"${FFMPEG_PATH}" -i "${tmpInput}" -vcodec libx264 -crf 28 -preset fast -acodec aac -movflags +faststart "${tmpOutput}"`,
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    const compressed = fs.readFileSync(tmpOutput);
    return compressed;
  } finally {
    try { fs.unlinkSync(tmpInput); } catch (_) {}
    try { fs.unlinkSync(tmpOutput); } catch (_) {}
  }
}

async function sendVideoMessage(to, video) {
  if (!video) return;
  try {
    const preparado = await obtenerStreamDrive(video.url);
    const mediaMime =
      preparado.mime && preparado.mime.startsWith("video/")
        ? preparado.mime
        : "video/mp4";
    const nombre = nombreArchivoSeguro(video.titulo || "video", mediaMime);
    console.log(
      `[sendVideoMessage] ${video.titulo || nombre} | mime=${mediaMime} | size=${preparado.size} bytes`,
    );
    const buffer = await streamToBuffer(preparado.stream);
    let mediaBuffer = buffer;
    if (ENABLE_VIDEO_COMPRESSION && preparado.size > 16 * 1024 * 1024) {
      console.log("[sendVideoMessage] Comprimiendo video...");
      mediaBuffer = await comprimirVideo(buffer, mediaMime);
      console.log(
        `[sendVideoMessage] Video comprimido: ${buffer.length} -> ${mediaBuffer.length} bytes`,
      );
    }
    const mediaId = await subirMedia(mediaBuffer, mediaMime, nombre);
    await enviarMediaPorId(to, "video", mediaId, video.titulo);
  } catch (e) {
    console.error("sendVideoMessage error:", e.message);
    const fileId = video.url.split("id=")[1];
    await sendWhatsApp(
      to,
      `*${video.titulo}*\n\n⚠️ El video supera el límite de subida de WhatsApp.\n\n› Ver tutorial: https://drive.google.com/file/d/${fileId}/view`,
    );
  }
}

function normalizarContactos(contacts) {
  return contacts.map((c) => {
    const nombre =
      (c.profile && c.profile.name) ||
      (c.name && c.name.formatted_name) ||
      "Sin nombre";
    const nombreStr = String(nombre).trim();
    const partes = nombreStr.split(/\s+/);
    const firstName = partes.shift() || nombreStr;
    const lastName = partes.join(" ");
    const crudo =
      c.wa_id ||
      (c.phones && c.phones[0] && (c.phones[0].wa_id || c.phones[0].phone)) ||
      "";
    const numero = String(crudo).replace(/\D/g, "");
    return {
      name: {
        formatted_name: nombreStr,
        first_name: firstName,
        last_name: lastName || undefined,
      },
      phones: [{ phone: numero, type: "CELL", wa_id: numero }],
    };
  });
}

async function enviarContactos(to, contacts) {
  const res = await fetchWithTimeout(messagesUrl(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "contacts",
      contacts,
    }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(
      `${data.error.message} ${JSON.stringify(data.error.error_data || data.error)}`,
    );
  }
  return data;
}

async function enviarUbicacion(to, location) {
  const res = await fetchWithTimeout(messagesUrl(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "location",
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        address: location.address,
      },
    }),
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(
      `${data.error.message} ${JSON.stringify(data.error.error_data || data.error)}`,
    );
  }
  return data;
}

async function reenviarMediaA(destinoPhone, message, agentePhone) {
  const tipo = message.type;

  if (tipo === "contacts") {
    if (!Array.isArray(message.contacts)) return;
    try {
      await enviarContactos(
        destinoPhone,
        normalizarContactos(message.contacts),
      );
    } catch (e) {
      console.error("reenviarMediaA (contacto) error:", e.message);
      try {
        await sendWhatsApp(destinoPhone, MENSAJE_ERROR_USUARIO);
      } catch (_) {}
      if (agentePhone) {
        try {
          await sendWhatsApp(
            agentePhone,
            `⚠️ No se pudo reenviar el contacto al cliente +${destinoPhone} (${e.message}).`,
          );
        } catch (_) {}
      }
    }
    return;
  }

  if (tipo === "location") {
    if (!message.location) return;
    try {
      await sendWhatsApp(
        destinoPhone,
        `📍 *Asesor ATI* compartió una *ubicación*:`,
      );
      await enviarUbicacion(destinoPhone, message.location);
    } catch (e) {
      console.error("reenviarMediaA (ubicación) error:", e.message);
      try {
        await sendWhatsApp(destinoPhone, MENSAJE_ERROR_USUARIO);
      } catch (_) {}
      if (agentePhone) {
        try {
          await sendWhatsApp(
            agentePhone,
            `⚠️ No se pudo reenviar la ubicación al cliente +${destinoPhone} (${e.message}).`,
          );
        } catch (_) {}
      }
    }
    return;
  }

  if (!TIPOS_MEDIA.has(tipo)) return;
  const mediaObj = message[tipo];
  if (!mediaObj || !mediaObj.id) return;

  const tipoLabel =
    {
      image: "imagen",
      audio: "audio",
      video: "video",
      document: "documento",
      sticker: "sticker",
    }[tipo] || tipo;

  try {
    await enviarMediaPorId(
      destinoPhone,
      tipo,
      mediaObj.id,
      mediaObj.caption,
      mediaObj.filename,
    );
  } catch (e) {
    try {
      const info = await infoMedia(mediaObj.id);
      const tamano = Number(info.file_size) || 0;
      const mime = info.mime_type || "";

      const { buffer } = await descargarDesdeMediaId(mediaObj.id);
      const nombre = nombreArchivoSeguro(
        mediaObj.filename,
        mime || "application/octet-stream",
      );
      let mediaId;
      try {
        mediaId = await subirMedia(buffer, mime, nombre);
      } catch (upErr) {
        if (/demasiado grande|too large|file_size|131052/i.test(upErr.message)) {
          mediaId = mediaObj.id;
        } else {
          throw upErr;
        }
      }
      await enviarMediaPorId(
        destinoPhone,
        tipo,
        mediaId,
        mediaObj.caption,
        nombre,
      );
    } catch (fallbackErr) {
      console.error("reenviarMediaA error:", fallbackErr.message);
      try {
        await sendWhatsApp(destinoPhone, MENSAJE_ERROR_USUARIO);
      } catch (_) {}
      if (agentePhone) {
        try {
          await sendWhatsApp(
            agentePhone,
            `⚠️ No se pudo reenviar el ${tipoLabel} al cliente +${destinoPhone} (${fallbackErr.message}).`,
          );
        } catch (_) {}
      }
    }
  }
}

async function reenviarMediaAlAsesor(agentePhone, clientePhone, message) {
  const tipo = message.type;

  if (tipo === "contacts") {
    if (!Array.isArray(message.contacts)) return;
    try {
      await sendWhatsApp(
        agentePhone,
        `📎 *Usuario +${clientePhone}* envió un *contacto*:`,
      );
      await enviarContactos(agentePhone, normalizarContactos(message.contacts));
    } catch (e) {
      console.error("reenviarMediaAlAsesor (contacto) error:", e.message);
      try {
        await sendWhatsApp(
          agentePhone,
          `⚠️ Error al reenviar el contacto del usuario +${clientePhone} (${e.message}). Revíselo directamente en WhatsApp.`,
        );
      } catch (_) {}
      try {
        await sendWhatsApp(clientePhone, MENSAJE_ERROR_USUARIO);
      } catch (_) {}
    }
    return;
  }

  if (tipo === "location") {
    if (!message.location) return;
    try {
      await sendWhatsApp(
        agentePhone,
        `📍 *Usuario +${clientePhone}* compartió una *ubicación*:`,
      );
      await enviarUbicacion(agentePhone, message.location);
    } catch (e) {
      console.error("reenviarMediaAlAsesor (ubicación) error:", e.message);
      try {
        await sendWhatsApp(
          agentePhone,
          `⚠️ Error al reenviar la ubicación del usuario +${clientePhone} (${e.message}). Revíselo directamente en WhatsApp.`,
        );
      } catch (_) {}
      try {
        await sendWhatsApp(clientePhone, MENSAJE_ERROR_USUARIO);
      } catch (_) {}
    }
    return;
  }

  if (!TIPOS_MEDIA.has(tipo)) return;
  const mediaObj = message[tipo];
  if (!mediaObj || !mediaObj.id) return;

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

    await enviarMediaPorId(
      agentePhone,
      tipo,
      mediaObj.id,
      mediaObj.caption,
      mediaObj.filename,
    );
  } catch (e) {
    try {
      const info = await infoMedia(mediaObj.id);
      const tamano = Number(info.file_size) || 0;
      const mime = info.mime_type || "";

      const { buffer } = await descargarDesdeMediaId(mediaObj.id);
      const nombre = nombreArchivoSeguro(
        mediaObj.filename,
        mime || "application/octet-stream",
      );
      let mediaId;
      try {
        mediaId = await subirMedia(buffer, mime, nombre);
      } catch (upErr) {
        if (/demasiado grande|too large|file_size|131052/i.test(upErr.message)) {
          mediaId = mediaObj.id;
        } else {
          throw upErr;
        }
      }
      await enviarMediaPorId(
        agentePhone,
        tipo,
        mediaId,
        mediaObj.caption,
        nombre,
      );
    } catch (fallbackErr) {
      console.error("reenviarMediaAlAsesor error:", fallbackErr.message);
      try {
        await sendWhatsApp(
          agentePhone,
          `⚠️ Error al reenviar el ${tipoLabel} del usuario +${clientePhone} (${fallbackErr.message}). Revíselo directamente en WhatsApp.`,
        );
      } catch (_) {}
      try {
        await sendWhatsApp(clientePhone, MENSAJE_ERROR_USUARIO);
      } catch (_) {}
    }
  }
}

async function sendFlowMessage(to, bodyText, flowId, ctaText, flowToken) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "flow",
      body: { text: bodyText },
      action: {
        name: "flow",
        parameters: {
          flow_message_version: "2.1",
          flow_token: flowToken || "default",
          flow_id: flowId,
          flow_cta: ctaText || "Abrir",
        },
      },
    },
  };
  const res = await fetchWithTimeout(messagesUrl(), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "sendFlowMessage failed");
  }
  return data;
}

module.exports = {
  sendWhatsApp,
  sendInteractiveList,
  sendFlowMessage,
  sendVideoMessage,
  reenviarMediaAlAsesor,
  reenviarMediaA,
  OPCION_ASESOR,
};

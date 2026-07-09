// bot/session.js

const sessions = {};

function getSession(phone) {
  if (!sessions[phone]) {
    sessions[phone] = {
      history: [],
      attempts: 0,
      primerMensaje: true,
      nombre: null,
      contexto: null,
      menu: null,
      app: null,
      submenu: null,
      encuestaRespuestas: {},
    };
  }
  return sessions[phone];
}

module.exports = { getSession, sessions };

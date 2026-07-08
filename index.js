require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json({ limit: "1mb" }));

const { handleWebhook } = require("./bot/handlers/webhook");

app.get("/webhook", (req, res) => {
  const {
    "hub.mode": mode,
    "hub.verify_token": token,
    "hub.challenge": challenge,
  } = req.query;
  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN)
    res.status(200).send(challenge);
  else res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  await handleWebhook(req, res);
});

app.get("/", (req, res) =>
  res.json({
    status: "· ATI Bot funcionando",
    timestamp: new Date().toISOString(),
  }),
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ATI Bot corriendo en puerto ${PORT}`));

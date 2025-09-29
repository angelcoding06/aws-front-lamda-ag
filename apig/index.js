const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); 
const app = express();
// cambio pequeño
//segundo cambio pequeño
app.use(bodyParser.json());
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const VALID_TOKEN = "valid-token";

let notifications = {};
let clients = {};
const MATCH_SERVICE_URL = process.env.MATCH_SERVICE_URL;

app.post("/match", async (req, res) => {
  const { token, idUser, queueType } = req.body;

  if (token !== VALID_TOKEN) {
    return res.status(401).json({ error: "Token inválido" });
  }

  console.log("Match request:", { idUser, queueType });

  try {
    const response = await fetch(`${MATCH_SERVICE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUser, queueType }),
    });

    if (!response.ok) {
      throw new Error(`Error al llamar servicio externo: ${response.statusText}`);
    }

    const data = await response.json();

    return res.json({
      status: "Match solicitado",
      idUser,
      queueType,
      externalResponse: data,
    });
  } catch (err) {
    console.error("Error en fetch:", err);
    return res.status(500).json({ error: "Fallo en el servicio externo" });
  }
});
app.get("/health", (req, res) => {
  res.status(200).send("Healthy");
});

app.post("/notify", (req, res) => {
  const { userId, idPartida } = req.body;
  if (!userId || !idPartida) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  const notif = { idPartida, msg: `Partida ${idPartida} creada` };

  if (!notifications[userId]) notifications[userId] = [];
  notifications[userId].push(notif);


  if (clients[userId]) {
    clients[userId].forEach((c) => c.res.write(`data: ${JSON.stringify(notif)}\n\n`));
  }

  console.log(`Notificación enviada a ${userId}:`, notif);
  res.json({ status: "ok", notif });
});

app.get("/notifications/:idUser", (req, res) => {
  const { idUser } = req.params;
  const { token } = req.query;

  if (token !== VALID_TOKEN) {
    return res.status(401).end("Token inválido");
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  if (!clients[idUser]) clients[idUser] = [];
  clients[idUser].push({ res });

  console.log(`SSE conectado: ${idUser}`);

  req.on("close", () => {
    clients[idUser] = clients[idUser].filter((c) => c.res !== res);
    console.log(`SSE cerrado: ${idUser}`);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API Gateway corriendo en puerto ${PORT}`));

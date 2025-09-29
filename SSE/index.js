export const handler = async (event)  => {
  console.log("Evento recibido:", JSON.stringify(event));
  const { idPartida, userId } = event || {};
  console.log("idPartida:", idPartida);

  if (!idPartida || !userId) {
    return { status: "error", message: "Faltan parámetros" };
  }

  try {
    const res = await fetch(process.env.BACKEND_URL + "/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, idPartida }),
    });

    const data = await res.json().catch(() => null);

    console.log(`Notificación enviada a ${userId}`);
    return { status: "ok", response: data };
  } catch (err) {
    console.error("Error enviando notificación:", err);
    return { status: "error", message: err.message };
  }
};

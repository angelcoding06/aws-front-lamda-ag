const { handler } = require("./index");

// Simula el evento que AWS EventBridge enviaría
const event = {
  detail: {
    idPartida: "abc123",
    userId: "123"
  }
};

handler(event)
  .then(res => console.log("✅ Lambda result:", res))
  .catch(err => console.error("❌ Lambda error:", err));

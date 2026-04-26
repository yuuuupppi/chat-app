import app from "./src/app.js";
import config from "./src/config.js";

const server = app.listen(config.port, () => {
  console.log(`🚀 Сервер запущен на порту ${config.port}`);
  console.log(`📝 Режим: ${config.nodeEnv}`);
  console.log(`🔗 http://localhost:${config.port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM сигнал получен, закрываю сервер...");
  server.close(() => {
    console.log("Сервер закрыт");
    process.exit(0);
  });
});

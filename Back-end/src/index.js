require("dotenv").config();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const revisionesRouter = require("./routes/revisiones");
const equiposRouter = require("./routes/equipos");

const app = express();
const PORT = process.env.PORT || 3000;

// Verificación de variables de entorno críticas
const requiredEnvVars = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(
    `❌ ERROR: Variables de entorno faltantes: ${missingVars.join(", ")}`
  );
  process.exit(1);
}

// CORS ajustado para permitir peticiones desde la app móvil (React Native)
app.use(
  cors({
    origin: "*", // Permitir desde cualquier origen en desarrollo
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "apikey", "Prefer"], // Cabeceras usadas en tu front
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ ok: true, message: "🚀 API Backend funcionando correctamente" });
});

app.use("/api/revisiones", revisionesRouter);
app.use("/api/equipos", equiposRouter);

app.use(errorHandler);

console.log(`\n📡 Iniciando backend...`);
console.log(`   - Puerto: ${PORT}`);
console.log(`   - Supabase URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL}`);
console.log(`   - Node Env: ${process.env.NODE_ENV || "development"}\n`);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor escuchando en puerto ${PORT}`);
  console.log(`\n📌 Endpoints disponibles:`);
  console.log(`   POST   http://localhost:${PORT}/api/revisiones`);
  console.log(`   GET    http://localhost:${PORT}/api/revisiones`);
  console.log(`   GET    http://localhost:${PORT}/api/revisiones/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/revisiones/:id\n`);
  console.log(`   POST   http://localhost:${PORT}/api/equipos`);
  console.log(`   GET    http://localhost:${PORT}/api/equipos/:numero_serie\n`);
});

// Manejo de errores del servidor
server.on("error", (err) => {
  console.error(`❌ Error en el servidor:`, err.message);
  if (err.code === "EADDRINUSE") {
    console.error(`   Puerto ${PORT} ya está en uso.`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📌 SIGTERM recibido, cerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor cerrado");
    process.exit(0);
  });
});


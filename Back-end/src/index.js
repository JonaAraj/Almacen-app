require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const revisionesRouter = require("./routes/revisiones");
const equiposRouter = require("./routes/equipos");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS ajustado para permitir peticiones desde la app móvil (React Native)
app.use(
  cors({
    origin: "*", // Permitir desde cualquier origen en desarrollo
    methods: ["GET", "POST", "PUT", "DELETE"],
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

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log("Endpoints disponibles:");
  console.log(`   POST   http://localhost:${PORT}/api/revisiones`);
  console.log(`   GET    http://localhost:${PORT}/api/revisiones`);
  console.log(`   GET    http://localhost:${PORT}/api/revisiones/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/revisiones/:id\n`);
  console.log(`   POST   http://localhost:${PORT}/api/equipos`);
});

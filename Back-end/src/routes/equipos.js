const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

router.post("/", async (req, res, next) => {
  const {
    numero_serie,
    tipo_equipo,
    modelo,
    marca,
    fecha_registro,
    procesador,
    almacenamiento,
  } = req.body;

  try {
    // 1. Guardar el nuevo equipo usando la API de Supabase
    const { data: nuevoEquipo, error: equipoError } = await supabase
      .from("equipos")
      .insert([{
        numero_serie,
        tipo_equipo,
        modelo,
        marca,
        procesador,
        almacenamiento,
        fecha_registro: fecha_registro || new Date().toISOString()
      }])
      .select()
      .single();

    if (equipoError) {
      // "23505" es el código de PostgreSQL para errores de valores únicos duplicados (unique_violation)
      if (equipoError.code === "23505") {
        return res.status(400).json({ error: "Ya existe un equipo registrado con ese número de serie" });
      }
      throw equipoError; // Para que pase al bloque catch y de ahí al errorHandler
    }

    // 2. Identificar el reporte de diagnóstico asociado usando el número de serie
    const { data: revisionAsociada, error: revisionError } = await supabase
      .from("diagnosticos")
      .select("*")
      .eq("numero_serie", numero_serie)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // maybeSingle() no arroja error si no encuentra coincidencias, retorna null

    if (revisionError) {
      throw revisionError;
    }

    res.status(201).json({ ok: true, equipo: nuevoEquipo, revisionAsociada: revisionAsociada || null });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

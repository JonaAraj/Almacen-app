const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// GET: Obtener datos de un equipo y su último diagnóstico por número de serie
router.get("/:numero_serie", async (req, res, next) => {
  const { numero_serie } = req.params;
  
  try {
    // 1. Buscar equipo, pero no fallar si no existe
    const { data: equipo, error: eqError } = await supabase
      .from("equipos")
      .select("*")
      .eq("numero_serie", numero_serie)
      .maybeSingle();

    if (eqError) {
      throw eqError;
    }

    // 2. Buscar último diagnóstico
    const { data: diagnostico, error: diagError } = await supabase
      .from("diagnosticos")
      .select("*")
      .eq("numero_serie", numero_serie)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (diagError) throw diagError;

    if (!equipo && !diagnostico) {
      return res.status(404).json({ ok: false, error: "No se encontró ningún equipo o diagnóstico con ese número de serie" });
    }

    res.status(200).json({
      ok: true,
      data: {
        numero_serie,
        equipo: equipo || null,
        diagnostico: diagnostico || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const {
    numero_serie,
    tipo_equipo,
    modelo,
    marca,
    fecha_registro,
    procesador,
    almacenamiento,
    dueno,
    fecha_ingreso,
  } = req.body;

  try {
    const { data: nuevoEquipo, error: equipoError } = await supabase
      .from("equipos")
      .insert([{
        numero_serie,
        tipo_equipo,
        modelo,
        marca,
        procesador,
        almacenamiento,
        dueno,
        fecha_ingreso,
        fecha_registro: fecha_registro || new Date().toISOString()
      }])
      .select()
      .single();

    if (equipoError) {
      if (equipoError.code === "23505") {
        return res.status(400).json({ error: "Ya existe un equipo registrado con ese número de serie" });
      }
      throw equipoError;
    }

    const { data: revisionAsociada, error: revisionError } = await supabase
      .from("diagnosticos")
      .select("*")
      .eq("numero_serie", numero_serie)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (revisionError) {
      throw revisionError;
    }

    res.status(201).json({ ok: true, equipo: nuevoEquipo, revisionAsociada: revisionAsociada || null });
  } catch (error) {
    next(error);
  }
});

router.patch("/:numero_serie", async (req, res, next) => {
  const { numero_serie } = req.params;
  const {
    numero_serie: new_numero_serie,
    tipo_equipo,
    modelo,
    marca,
    procesador,
    almacenamiento,
    dueno,
    fecha_ingreso,
  } = req.body;

  try {
    const payload = {
      ...(new_numero_serie ? { numero_serie: new_numero_serie } : {}),
      tipo_equipo,
      modelo,
      marca,
      procesador,
      almacenamiento,
      dueno,
      fecha_ingreso,
    };

    const { data: equipoActualizado, error: updateError } = await supabase
      .from("equipos")
      .update(payload)
      .eq("numero_serie", numero_serie)
      .select()
      .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!equipoActualizado) {
      return res.status(404).json({ ok: false, error: "Equipo no encontrado para actualizar" });
    }

    res.status(200).json({ ok: true, data: equipoActualizado });
  } catch (error) {
    next(error);
  }
});

router.delete("/:numero_serie", async (req, res, next) => {
  const { numero_serie } = req.params;

  try {
    const { data, error } = await supabase
      .from("equipos")
      .delete()
      .eq("numero_serie", numero_serie);

    if (error) {
      throw error;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ ok: false, error: "Equipo no encontrado para eliminar" });
    }

    res.status(200).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

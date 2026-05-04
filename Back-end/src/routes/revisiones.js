const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// GET: Obtener todas las revisiones (diagnósticos)
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("diagnosticos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

// GET: Obtener una revisión específica por su ID
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("diagnosticos")
      .select("*")
      .eq("id_diagnostico", id)
      .single();

    if (error) throw error;

    res.status(200).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

// POST: Crear una nueva revisión
router.post("/", async (req, res, next) => {
  const {
    numero_serie,
    id_equipo,
    id_empleado,
    detalles_revision,
    estatus_final,
    observaciones_extra,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("diagnosticos")
      .insert([
        {
          numero_serie,
          id_equipo,
          id_empleado,
          detalles_revision,
          estatus_final,
          observaciones_extra,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

// DELETE: Eliminar una revisión
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("diagnosticos")
      .delete()
      .eq("id_diagnostico", id);

    if (error) throw error;

    res
      .status(200)
      .json({ ok: true, message: "Revisión eliminada correctamente" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

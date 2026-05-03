const express = require('express');
const router = express.Router();
// IMPORTANTE: Ajusta esta ruta según la ubicación de tu conexión a PostgreSQL
const pool = require('../db'); 

router.post('/', async (req, res, next) => {
    const { numeroSerie, modelo, marca, procesador, almacenamiento, fechaIngreso } = req.body;
    const { numero_serie, tipo_equipo, modelo, marca } = req.body;

    try {
        // 1. Guardar el nuevo equipo en la tabla de equipos
        const insertQuery = `
            INSERT INTO equipos (numero_serie, modelo, marca, procesador, almacenamiento, fecha_ingreso)
            VALUES ($1, $2, $3, $4, $5, $6)
            INSERT INTO equipos (numero_serie, tipo_equipo, modelo, marca)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const equipoResult = await pool.query(insertQuery, [numeroSerie, modelo, marca, procesador, almacenamiento, fechaIngreso]);
        const equipoResult = await pool.query(insertQuery, [numero_serie, tipo_equipo, modelo, marca]);
        const nuevoEquipo = equipoResult.rows[0];

        // 2. Identificar el reporte de diagnóstico asociado usando el número de serie
        const revisionQuery = `
            SELECT * FROM revisiones WHERE numero_serie = $1 ORDER BY id DESC LIMIT 1;
            SELECT * FROM diagnosticos WHERE numero_serie = $1 ORDER BY created_at DESC LIMIT 1;
        `;
        const revisionResult = await pool.query(revisionQuery, [numeroSerie]);
        const revisionResult = await pool.query(revisionQuery, [numero_serie]);
        const revisionAsociada = revisionResult.rows.length > 0 ? revisionResult.rows[0] : null;

        res.status(201).json({ ok: true, equipo: nuevoEquipo, revisionAsociada });
    } catch (error) {
        if (error.code === '23505') { // Código de PostgreSQL para errores de valores únicos duplicados
            return res.status(400).json({ error: 'Ya existe un equipo registrado con ese número de serie' });
        }
        next(error);
    }
});

module.exports = router;
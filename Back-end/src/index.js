require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const revisionesRouter = require('./routes/revisiones');
const equiposRouter = require('./routes/equipos');
const { ok } = require('assert');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ 
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
})
);

app.use(express.json());

app.use('/api/revisiones', revisionesRouter);
app.use('/api/equipos', equiposRouter);

app.get('/', (req, res) => {
    res.status(404).json({ ok: false, message: 'Endpoint no encontrado' });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log('Endpoints disponibles:');
    console.log(`   POST   http://localhost:${PORT}/api/revisiones`);
    console.log(`   GET    http://localhost:${PORT}/api/revisiones`);
    console.log(`   GET    http://localhost:${PORT}/api/revisiones/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/revisiones/:id\n`);
    console.log(`   POST   http://localhost:${PORT}/api/equipos`);
});

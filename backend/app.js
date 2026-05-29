const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Inicializar base de datos al arrancar
require('./database/init');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productorRoutes = require('./routes/productorRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const mapsRoutes = require('./routes/mapsRoutes');
const productoRoutes = require('./routes/productoRoutes');
const preventaRoutes = require('./routes/preventaRoutes');
const busquedaRoutes = require('./routes/busquedaRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');

const app = express();

// =========================================
// SEGURIDAD
// =========================================
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));

// Rate limiting global
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas solicitudes, intente de nuevo más tarde' },
});
app.use('/api/', limiter);

// =========================================
// PARSERS
// =========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================================
// RUTAS
// =========================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/productores', productorRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/preventas', preventaRoutes);
app.use('/api/busqueda', busquedaRoutes);
app.use('/api/categorias', categoriaRoutes);

// =========================================
// HEALTH CHECK
// =========================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =========================================
// ERROR HANDLING GLOBAL
// =========================================
app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'El archivo excede el tamaño máximo permitido' });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'El archivo excede el tamaño máximo de 5MB' });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token inválido' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
    }

    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
    });
});

module.exports = app;

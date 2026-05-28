const { getConnection } = require('../database/connection');

const productorController = {
    listarProductores(req, res, next) {
        try {
            const db = getConnection();
            const productores = db.prepare(`
                SELECT p.*, u.nombre_completo, u.correo, u.celular, u.estado_verificacion
                FROM productores p
                JOIN usuarios u ON p.usuario_id = u.id
                ORDER BY p.nombre_finca ASC
            `).all();
            res.json(productores);
        } catch (error) {
            next(error);
        }
    },

    obtenerProductor(req, res, next) {
        try {
            const db = getConnection();
            const productor = db.prepare(`
                SELECT p.*, u.nombre_completo, u.correo, u.celular, u.estado_verificacion
                FROM productores p
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.id = ?
            `).get(req.params.id);

            if (!productor) {
                return res.status(404).json({ error: 'Productor no encontrado' });
            }

            res.json(productor);
        } catch (error) {
            next(error);
        }
    },

    obtenerMiPerfil(req, res, next) {
        try {
            const db = getConnection();
            const productor = db.prepare(`
                SELECT p.*, u.nombre_completo, u.correo, u.celular, u.foto_perfil, u.estado_verificacion
                FROM productores p
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.usuario_id = ?
            `).get(req.user.id);

            if (!productor) {
                return res.status(404).json({ error: 'Perfil de productor no encontrado. Complete su registro primero.' });
            }

            res.json(productor);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = productorController;

const { getConnection } = require('../database/connection');

const userController = {
    listarUsuarios(req, res, next) {
        try {
            const db = getConnection();
            const usuarios = db.prepare(`
                SELECT u.id, u.nombre_completo, u.correo, u.celular, u.estado_verificacion,
                       u.fecha_registro, r.nombre as rol_nombre
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                ORDER BY u.fecha_registro DESC
            `).all();
            res.json(usuarios);
        } catch (error) {
            next(error);
        }
    },

    obtenerUsuario(req, res, next) {
        try {
            const db = getConnection();
            const usuario = db.prepare(`
                SELECT u.*, r.nombre as rol_nombre
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                WHERE u.id = ?
            `).get(req.params.id);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            delete usuario.password;
            res.json(usuario);
        } catch (error) {
            next(error);
        }
    },

    listarPendientesVerificacion(req, res, next) {
        try {
            const db = getConnection();
            const usuarios = db.prepare(`
                SELECT u.id, u.nombre_completo, u.correo, u.celular, u.estado_verificacion,
                       u.fecha_registro, r.nombre as rol_nombre,
                       (SELECT COUNT(*) FROM documentos WHERE usuario_id = u.id) as total_documentos
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                WHERE u.estado_verificacion IN ('PENDIENTE', 'REGISTRADO')
                ORDER BY u.fecha_registro ASC
            `).all();
            res.json(usuarios);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = userController;

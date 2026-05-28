const { getConnection } = require('../database/connection');

const mapsController = {
    guardarUbicacion(req, res, next) {
        try {
            const { latitud, longitud, localidad } = req.body;

            if (latitud === undefined || longitud === undefined) {
                return res.status(400).json({ error: 'Latitud y longitud son requeridas' });
            }

            const db = getConnection();

            const productor = db.prepare('SELECT id FROM productores WHERE usuario_id = ?').get(req.user.id);
            if (!productor) {
                return res.status(404).json({ error: 'Perfil de productor no encontrado' });
            }

            db.prepare(`
                UPDATE productores SET latitud = ?, longitud = ?, localidad = ? WHERE id = ?
            `).run(latitud, longitud, localidad || '', productor.id);

            res.json({
                message: 'Ubicación guardada correctamente',
                ubicacion: { latitud, longitud, localidad },
            });
        } catch (error) {
            next(error);
        }
    },

    obtenerUbicacion(req, res, next) {
        try {
            const db = getConnection();

            const productor = db.prepare(`
                SELECT latitud, longitud, localidad FROM productores WHERE usuario_id = ?
            `).get(req.user.id);

            if (!productor) {
                return res.status(404).json({ error: 'Perfil de productor no encontrado' });
            }

            res.json(productor);
        } catch (error) {
            next(error);
        }
    },

    listarUbicacionesProductores(req, res, next) {
        try {
            const db = getConnection();
            const ubicaciones = db.prepare(`
                SELECT p.id, p.latitud, p.longitud, p.localidad, p.nombre_finca,
                       u.nombre_completo, u.celular
                FROM productores p
                JOIN usuarios u ON p.usuario_id = u.id
                WHERE p.latitud IS NOT NULL AND p.longitud IS NOT NULL
            `).all();

            res.json(ubicaciones);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = mapsController;

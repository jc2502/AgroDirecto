const productoService = require('../services/productoService');
const { compressAndSave } = require('../middlewares/uploadImages');
const { getConnection } = require('../database/connection');

const productoController = {
    async create(req, res, next) {
        try {
            const db = getConnection();
            const productor = db.prepare(
                'SELECT id FROM productores WHERE usuario_id = ?'
            ).get(req.user.id);

            if (!productor) {
                return res.status(403).json({ error: 'Debe tener perfil de productor' });
            }

            const usuario = db.prepare(
                'SELECT estado_verificacion FROM usuarios WHERE id = ?'
            ).get(req.user.id);

            if (usuario.estado_verificacion !== 'VERIFICADO') {
                return res.status(403).json({
                    error: 'Solo productores verificados pueden publicar. Complete la verificación documental primero.',
                });
            }

            const { nombre, categoria_id, variedad, cantidad_disponible, unidad_medida, precio, descripcion, fecha_disponibilidad } = req.body;

            if (!nombre || !categoria_id || cantidad_disponible === undefined || !unidad_medida || !precio) {
                return res.status(400).json({ error: 'Nombre, categoría, cantidad, unidad y precio son requeridos' });
            }

            if (parseFloat(cantidad_disponible) < 0) {
                return res.status(400).json({ error: 'La cantidad no puede ser negativa' });
            }

            if (parseFloat(precio) <= 0) {
                return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
            }

            let imagenesGuardadas = [];

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const filename = `prod-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
                    const ruta = await compressAndSave(file.buffer, filename);
                    imagenesGuardadas.push(ruta);
                }
            }

            const id = productoService.create(productor.id, {
                nombre, categoria_id: parseInt(categoria_id), variedad,
                cantidad_disponible: parseFloat(cantidad_disponible),
                unidad_medida, precio: parseFloat(precio),
                descripcion, fecha_disponibilidad: fecha_disponibilidad || null,
            }, imagenesGuardadas);

            res.status(201).json({ message: 'Producto publicado exitosamente', id });
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const db = getConnection();
            const productor = db.prepare(
                'SELECT id FROM productores WHERE usuario_id = ?'
            ).get(req.user.id);

            if (!productor) {
                return res.status(403).json({ error: 'Debe tener perfil de productor' });
            }

            const result = productoService.update(parseInt(req.params.id), productor.id, req.body);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    delete(req, res, next) {
        try {
            const db = getConnection();
            const productor = db.prepare(
                'SELECT id FROM productores WHERE usuario_id = ?'
            ).get(req.user.id);

            if (!productor) {
                return res.status(403).json({ error: 'Debe tener perfil de productor' });
            }

            const result = productoService.delete(parseInt(req.params.id), productor.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    getById(req, res, next) {
        try {
            const producto = productoService.getById(parseInt(req.params.id));
            res.json(producto);
        } catch (error) {
            next(error);
        }
    },

    getByProductor(req, res, next) {
        try {
            const productos = productoService.getByProductor(req.user.id);
            res.json(productos);
        } catch (error) {
            next(error);
        }
    },

    listAll(req, res, next) {
        try {
            const filters = {
                categoria_id: req.query.categoria_id,
                estado: req.query.estado,
                disponible: req.query.disponible === 'true',
                search: req.query.search,
            };
            const productos = productoService.listAll(filters);
            res.json(productos);
        } catch (error) {
            next(error);
        }
    },

    updateStock(req, res, next) {
        try {
            const db = getConnection();
            const productor = db.prepare(
                'SELECT id FROM productores WHERE usuario_id = ?'
            ).get(req.user.id);

            if (!productor) {
                return res.status(403).json({ error: 'Debe tener perfil de productor' });
            }

            const { cantidad } = req.body;
            if (cantidad === undefined) {
                return res.status(400).json({ error: 'La cantidad es requerida' });
            }

            const result = productoService.updateStock(parseInt(req.params.id), productor.id, parseFloat(cantidad));
            res.json(result);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = productoController;

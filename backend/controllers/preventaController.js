const preventaService = require('../services/preventaService');

const preventaController = {
    async reservar(req, res, next) {
        try {
            const { producto_id, cantidad } = req.body;
            if (!producto_id || cantidad === undefined) {
                return res.status(400).json({ error: 'Producto ID y cantidad son requeridos' });
            }

            const result = preventaService.reservar(req.user.id, parseInt(producto_id), parseFloat(cantidad));
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    },

    async confirmar(req, res, next) {
        try {
            const { producto_id } = req.body;
            if (!producto_id) {
                return res.status(400).json({ error: 'Producto ID es requerido' });
            }

            const result = preventaService.confirmar(req.user.id, parseInt(producto_id));
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async cancelar(req, res, next) {
        try {
            const { producto_id } = req.body;
            if (!producto_id) {
                return res.status(400).json({ error: 'Producto ID es requerido' });
            }

            const result = preventaService.cancelar(req.user.id, parseInt(producto_id));
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getMisReservas(req, res, next) {
        try {
            const result = preventaService.getReservasPorComprador(req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getProductorReservas(req, res, next) {
        try {
            const result = preventaService.getReservasPorProductor(req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = preventaController;

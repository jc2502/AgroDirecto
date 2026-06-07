const carritoService = require('../services/carritoService');

const carritoController = {
    async getCarrito(req, res, next) {
        try {
            const result = carritoService.getCarrito(req.user.id);
            res.json(result);
        } catch (err) { next(err); }
    },

    async addItem(req, res, next) {
        try {
            const { producto_id, cantidad } = req.body;
            if (!producto_id || !cantidad) {
                return res.status(400).json({ error: 'producto_id y cantidad son requeridos' });
            }
            const result = carritoService.addItem(req.user.id, parseInt(producto_id), parseFloat(cantidad));
            res.json(result);
        } catch (err) { next(err); }
    },

    async updateItem(req, res, next) {
        try {
            const { cantidad } = req.body;
            if (!cantidad) return res.status(400).json({ error: 'cantidad es requerida' });
            const result = carritoService.updateItem(req.user.id, parseInt(req.params.itemId), parseFloat(cantidad));
            res.json(result);
        } catch (err) { next(err); }
    },

    async removeItem(req, res, next) {
        try {
            const result = carritoService.removeItem(req.user.id, parseInt(req.params.itemId));
            res.json(result);
        } catch (err) { next(err); }
    },
};

module.exports = carritoController;

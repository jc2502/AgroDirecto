const transportistaService = require('../services/transportistaService');

const transportistaController = {
    async getRutasDisponibles(req, res, next) {
        try {
            const result = transportistaService.getRutasDisponibles(req.user.id);
            res.json(result);
        } catch (err) { next(err); }
    },

    async aceptarRuta(req, res, next) {
        try {
            const { pedido_id } = req.body;
            if (!pedido_id) return res.status(400).json({ error: 'pedido_id es requerido' });
            const result = transportistaService.aceptarRuta(req.user.id, parseInt(pedido_id));
            res.json(result);
        } catch (err) { next(err); }
    },

    async getMisRutas(req, res, next) {
        try {
            const result = transportistaService.getMisRutas(req.user.id);
            res.json(result);
        } catch (err) { next(err); }
    },

    async completarRuta(req, res, next) {
        try {
            const { hoja_ruta_id } = req.body;
            if (!hoja_ruta_id) return res.status(400).json({ error: 'hoja_ruta_id es requerido' });
            const result = transportistaService.completarRuta(req.user.id, parseInt(hoja_ruta_id));
            res.json(result);
        } catch (err) { next(err); }
    },
};

module.exports = transportistaController;

const pagosService = require('../services/pagosService');

const pagosController = {
    async generarQR(req, res, next) {
        try {
            const { pedido_id } = req.body;
            if (!pedido_id) return res.status(400).json({ error: 'pedido_id es requerido' });
            const result = pagosService.generarQR(req.user.id, parseInt(pedido_id));
            res.json(result);
        } catch (err) { next(err); }
    },

    async simularPago(req, res, next) {
        try {
            const { referencia } = req.body;
            if (!referencia) return res.status(400).json({ error: 'referencia es requerida' });
            const result = pagosService.simularPago(referencia);
            res.json(result);
        } catch (err) { next(err); }
    },

    async getPago(req, res, next) {
        try {
            const result = pagosService.getPagoByPedido(req.user.id, parseInt(req.params.pedidoId));
            res.json(result);
        } catch (err) { next(err); }
    },
};

module.exports = pagosController;

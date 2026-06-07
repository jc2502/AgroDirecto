const pedidosService = require('../services/pedidosService');

const pedidosController = {
    async checkout(req, res, next) {
        try {
            const result = pedidosService.checkout(req.user.id);
            res.status(201).json(result);
        } catch (err) { next(err); }
    },

    async getMisPedidos(req, res, next) {
        try {
            const result = pedidosService.getPedidosComprador(req.user.id);
            res.json(result);
        } catch (err) { next(err); }
    },

    async getPedido(req, res, next) {
        try {
            const result = pedidosService.getPedidoById(parseInt(req.params.id), req.user.id);
            res.json(result);
        } catch (err) { next(err); }
    },

    async confirmarEntrega(req, res, next) {
        try {
            const { pedido_id } = req.body;
            if (!pedido_id) return res.status(400).json({ error: 'pedido_id es requerido' });
            const result = pedidosService.confirmarEntrega(req.user.id, parseInt(pedido_id));
            res.json(result);
        } catch (err) { next(err); }
    },
};

module.exports = pedidosController;

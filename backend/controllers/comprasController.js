const comprasService = require('../services/comprasService');

const comprasController = {
    // Comprador compra un producto DISPONIBLE
    async comprar(req, res, next) {
        try {
            const { producto_id, cantidad, notas } = req.body;
            if (!producto_id || !cantidad) {
                return res.status(400).json({ error: 'producto_id y cantidad son requeridos' });
            }
            const result = comprasService.comprar(req.user.id, parseInt(producto_id), parseFloat(cantidad), notas);
            res.status(201).json(result);
        } catch (err) { next(err); }
    },

    // Productor marca compra directa como ENVIADO
    async marcarEnviado(req, res, next) {
        try {
            const { compra_id } = req.body;
            if (!compra_id) return res.status(400).json({ error: 'compra_id es requerido' });
            const result = comprasService.marcarEnviado(req.user.id, parseInt(compra_id));
            res.json(result);
        } catch (err) { next(err); }
    },

    // Comprador confirma entrega de compra directa
    async confirmarEntrega(req, res, next) {
        try {
            const { compra_id } = req.body;
            if (!compra_id) return res.status(400).json({ error: 'compra_id es requerido' });
            const result = comprasService.confirmarEntrega(req.user.id, parseInt(compra_id));
            res.json(result);
        } catch (err) { next(err); }
    },

    // Productor marca reserva/preventa como ENVIADA
    async marcarReservaEnviada(req, res, next) {
        try {
            const { reserva_id } = req.body;
            if (!reserva_id) return res.status(400).json({ error: 'reserva_id es requerido' });
            const result = comprasService.marcarReservaEnviada(req.user.id, parseInt(reserva_id));
            res.json(result);
        } catch (err) { next(err); }
    },

    // Comprador confirma entrega de reserva/preventa
    async confirmarEntregaReserva(req, res, next) {
        try {
            const { reserva_id } = req.body;
            if (!reserva_id) return res.status(400).json({ error: 'reserva_id es requerido' });
            const result = comprasService.confirmarEntregaReserva(req.user.id, parseInt(reserva_id));
            res.json(result);
        } catch (err) { next(err); }
    },

    // Historial unificado del comprador
    async getHistorial(req, res, next) {
        try {
            const result = comprasService.getHistorialComprador(req.user.id);
            res.json(result);
        } catch (err) { next(err); }
    },

    // Productor rechaza compra pendiente (restaura stock)
    async rechazar(req, res, next) {
        try {
            const { compra_id } = req.body;
            if (!compra_id) return res.status(400).json({ error: 'compra_id es requerido' });
            const result = comprasService.rechazar(req.user.id, parseInt(compra_id));
            res.json(result);
        } catch (err) { next(err); }
    },

    // Ventas del productor (compras + reservas)
    async getVentas(req, res, next) {
        try {
            const result = comprasService.getVentasProductor(req.user.id);
            res.json(result);
        } catch (err) { next(err); }
    },
};

module.exports = comprasController;

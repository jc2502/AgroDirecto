const notificacionService = require('../services/notificacionService');

const notificacionController = {
    getMisNotificaciones(req, res, next) {
        try {
            const notificaciones = notificacionService.getByUsuario(req.user.id);
            res.json(notificaciones);
        } catch (error) {
            next(error);
        }
    },

    marcarLeido(req, res, next) {
        try {
            const result = notificacionService.marcarLeido(parseInt(req.params.id), req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    marcarTodasLeido(req, res, next) {
        try {
            const result = notificacionService.marcarTodasLeido(req.user.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    contarNoLeidas(req, res, next) {
        try {
            const total = notificacionService.contarNoLeidas(req.user.id);
            res.json({ total });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = notificacionController;

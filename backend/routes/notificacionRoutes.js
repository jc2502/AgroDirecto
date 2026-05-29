const { Router } = require('express');
const notificacionController = require('../controllers/notificacionController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

router.get('/', authenticate, notificacionController.getMisNotificaciones);
router.get('/contar', authenticate, notificacionController.contarNoLeidas);
router.put('/:id/leer', authenticate, notificacionController.marcarLeido);
router.put('/leer-todas', authenticate, notificacionController.marcarTodasLeido);

module.exports = router;

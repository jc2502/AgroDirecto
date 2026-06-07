const { Router } = require('express');
const comprasController = require('../controllers/comprasController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.post('/comprar', authenticate, authorize('COMPRADOR'), comprasController.comprar);
router.post('/marcar-enviado', authenticate, authorize('PRODUCTOR'), comprasController.marcarEnviado);
router.post('/rechazar', authenticate, authorize('PRODUCTOR'), comprasController.rechazar);
router.post('/confirmar-entrega', authenticate, authorize('COMPRADOR'), comprasController.confirmarEntrega);
router.post('/marcar-reserva-enviada', authenticate, authorize('PRODUCTOR'), comprasController.marcarReservaEnviada);
router.post('/confirmar-entrega-reserva', authenticate, authorize('COMPRADOR'), comprasController.confirmarEntregaReserva);
router.get('/historial', authenticate, authorize('COMPRADOR'), comprasController.getHistorial);
router.get('/ventas', authenticate, authorize('PRODUCTOR'), comprasController.getVentas);

module.exports = router;

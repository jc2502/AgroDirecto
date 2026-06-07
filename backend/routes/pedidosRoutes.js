const { Router } = require('express');
const pedidosController = require('../controllers/pedidosController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.post('/checkout', authenticate, authorize('COMPRADOR'), pedidosController.checkout);
router.get('/mis-pedidos', authenticate, authorize('COMPRADOR'), pedidosController.getMisPedidos);
router.get('/:id', authenticate, authorize('COMPRADOR'), pedidosController.getPedido);
router.post('/confirmar-entrega', authenticate, authorize('COMPRADOR'), pedidosController.confirmarEntrega);

module.exports = router;

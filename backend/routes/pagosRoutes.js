const { Router } = require('express');
const pagosController = require('../controllers/pagosController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.post('/generar-qr', authenticate, authorize('COMPRADOR'), pagosController.generarQR);
router.post('/simular', pagosController.simularPago);
router.get('/pedido/:pedidoId', authenticate, authorize('COMPRADOR'), pagosController.getPago);

module.exports = router;

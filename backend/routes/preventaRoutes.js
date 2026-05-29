const { Router } = require('express');
const preventaController = require('../controllers/preventaController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

// Compradores
router.post('/reservar', authenticate, authorize('COMPRADOR'), preventaController.reservar);
router.get('/mis-reservas', authenticate, authorize('COMPRADOR'), preventaController.getMisReservas);

// Productores
router.post('/confirmar', authenticate, authorize('PRODUCTOR'), preventaController.confirmar);
router.post('/cancelar', authenticate, authorize('PRODUCTOR'), preventaController.cancelar);
router.get('/productor/reservas', authenticate, authorize('PRODUCTOR'), preventaController.getProductorReservas);

module.exports = router;

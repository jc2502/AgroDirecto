const { Router } = require('express');
const carritoController = require('../controllers/carritoController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.get('/', authenticate, authorize('COMPRADOR'), carritoController.getCarrito);
router.post('/items', authenticate, authorize('COMPRADOR'), carritoController.addItem);
router.put('/items/:itemId', authenticate, authorize('COMPRADOR'), carritoController.updateItem);
router.delete('/items/:itemId', authenticate, authorize('COMPRADOR'), carritoController.removeItem);

module.exports = router;

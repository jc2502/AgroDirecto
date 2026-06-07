const { Router } = require('express');
const productoController = require('../controllers/productoController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const { upload } = require('../middlewares/uploadImages');

const router = Router();

router.get('/', productoController.listAll);
router.get('/:id', productoController.getById);

router.get('/mis-productos/lista', authenticate, authorize('PRODUCTOR'), productoController.getByProductor);

router.post('/crear', authenticate, authorize('PRODUCTOR'), upload.array('imagenes', 5), productoController.create);

router.put('/:id', authenticate, authorize('PRODUCTOR'), upload.array('imagenes', 5), productoController.update);

router.put('/:id/stock', authenticate, authorize('PRODUCTOR'), productoController.updateStock);

router.delete('/:id', authenticate, authorize('PRODUCTOR'), productoController.delete);

module.exports = router;

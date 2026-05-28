const { Router } = require('express');
const productorController = require('../controllers/productorController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.get('/', productorController.listarProductores);
router.get('/mi-perfil', authenticate, authorize('PRODUCTOR'), productorController.obtenerMiPerfil);
router.get('/:id', productorController.obtenerProductor);

module.exports = router;

const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), userController.listarUsuarios);
router.get('/verificacion-pendiente', authenticate, authorize('ADMIN'), userController.listarPendientesVerificacion);
router.get('/:id', authenticate, userController.obtenerUsuario);

module.exports = router;

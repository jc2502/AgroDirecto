const { Router } = require('express');
const mapsController = require('../controllers/mapsController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.post('/ubicacion', authenticate, authorize('PRODUCTOR'), mapsController.guardarUbicacion);
router.get('/ubicacion', authenticate, authorize('PRODUCTOR'), mapsController.obtenerUbicacion);
router.get('/productores', mapsController.listarUbicacionesProductores);

module.exports = router;

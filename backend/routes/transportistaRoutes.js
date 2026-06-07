const { Router } = require('express');
const transportistaController = require('../controllers/transportistaController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.get('/rutas-disponibles', authenticate, authorize('TRANSPORTISTA'), transportistaController.getRutasDisponibles);
router.post('/aceptar-ruta', authenticate, authorize('TRANSPORTISTA'), transportistaController.aceptarRuta);
router.get('/mis-rutas', authenticate, authorize('TRANSPORTISTA'), transportistaController.getMisRutas);
router.post('/completar-ruta', authenticate, authorize('TRANSPORTISTA'), transportistaController.completarRuta);

module.exports = router;

const { Router } = require('express');
const busquedaController = require('../controllers/busquedaController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

router.get('/', (req, res, next) => {
    if (req.headers.authorization) {
        return authenticate(req, res, () => busquedaController.buscar(req, res, next));
    }
    return busquedaController.buscar(req, res, next);
});

module.exports = router;

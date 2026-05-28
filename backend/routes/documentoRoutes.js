const { Router } = require('express');
const documentoController = require('../controllers/documentoController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const { upload } = require('../middlewares/upload');

const router = Router();

router.post('/subir', authenticate, upload.single('archivo'), documentoController.subir);
router.get('/mis-documentos', authenticate, documentoController.listarMisDocumentos);
router.get('/pendientes', authenticate, authorize('ADMIN'), documentoController.listarPendientes);
router.get('/todos', authenticate, authorize('ADMIN'), documentoController.listarTodos);
router.put('/:id/aprobar', authenticate, authorize('ADMIN'), documentoController.aprobar);
router.put('/:id/rechazar', authenticate, authorize('ADMIN'), documentoController.rechazar);

module.exports = router;

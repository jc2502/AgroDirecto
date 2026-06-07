const { Router } = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');

const router = Router();

router.get('/kpis', authenticate, authorize('ADMIN'), analyticsController.getKPIs);

module.exports = router;

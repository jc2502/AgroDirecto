const { Router } = require('express');
const { getConnection } = require('../database/connection');

const router = Router();

router.get('/', (req, res, next) => {
    try {
        const db = getConnection();
        const cats = db.prepare('SELECT * FROM categorias ORDER BY id ASC').all();
        res.json(cats);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

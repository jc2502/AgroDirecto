const analyticsService = require('../services/analyticsService');

const analyticsController = {
    async getKPIs(req, res, next) {
        try {
            const result = analyticsService.getKPIs();
            res.json(result);
        } catch (err) { next(err); }
    },
};

module.exports = analyticsController;

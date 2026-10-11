const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/analyticsController');

r.get('/analytics', auth(), c.getAnalytics);

module.exports = r;

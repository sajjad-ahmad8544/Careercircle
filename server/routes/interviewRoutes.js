const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/interviewController');

r.get('/interview', auth(), c.getInterview);
r.post('/interview', auth(), c.postInterview);

module.exports = r;

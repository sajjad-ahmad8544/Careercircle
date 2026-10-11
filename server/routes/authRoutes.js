const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/authController');

r.post('/auth/register', c.postAuthRegister);
r.post('/auth/login', c.postAuthLogin);
r.get('/me', auth(), c.getMe);
r.put('/me', auth(), c.putMe);

module.exports = r;

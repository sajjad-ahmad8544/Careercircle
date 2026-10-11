const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/chatController');

r.get('/people', auth(), c.getPeople);
r.get('/messages/:uid', auth(), c.getMessagesByUid);
r.post('/messages/:uid', auth(), c.postMessagesByUid);

module.exports = r;
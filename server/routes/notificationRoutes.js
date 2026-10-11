const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/notificationController');

r.get('/notifications', auth(), c.getNotifications);
r.put('/notifications/read', auth(), c.putNotificationsRead);

module.exports = r;

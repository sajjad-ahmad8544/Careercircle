const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/adminController');
const adm = auth(['admin']);

r.get('/admin/stats', adm, c.getAdminStats);
r.get('/admin/users', adm, c.getAdminUsers);
r.put('/admin/users/:id', adm, c.putAdminUsersById);
r.delete('/admin/users/:id', adm, c.deleteAdminUsersById);
r.put('/admin/mentors/:id', adm, c.putAdminMentorsById);
r.get('/admin/jobs', adm, c.getAdminJobs);
r.get('/admin/sessions', adm, c.getAdminSessions);
r.put('/admin/sessions/:id', adm, c.putAdminSessionsById);
r.get('/admin/reviews', adm, c.getAdminReviews);
r.delete('/admin/reviews/:id', adm, c.deleteAdminReviewsById);
r.post('/admin/announce', adm, c.postAdminAnnounce);

module.exports = r;
const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/mentorController');

r.get('/mentors', auth(), c.getMentors);
r.post('/sessions', auth(['student']), c.postSessions);
r.get('/sessions', auth(), c.getSessions);
r.put('/sessions/:id', auth(['mentor']), c.putSessionsById);
r.get('/reviews/:mentor', auth(), c.getReviewsByMentor);
r.post('/reviews', auth(['student']), c.postReviews);

module.exports = r;

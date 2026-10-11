const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/jobController');

r.get('/jobs', auth(), c.getJobs);
r.post('/jobs', auth(['mentor', 'admin']), c.postJobs);
r.delete('/jobs/:id', auth(['admin']), c.deleteJobsById);
r.post('/apply/:job', auth(['student']), c.postApplyByJob);
r.get('/applications', auth(), c.getApplications);
r.put('/applications/:id', auth(['mentor', 'admin']), c.putApplicationsById);

module.exports = r;
const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/projectController');

r.get('/projects', auth(), c.getProjects);
r.post('/projects', auth(), c.postProjects);
r.delete('/projects/:id', auth(), c.deleteProjectsById);

module.exports = r;

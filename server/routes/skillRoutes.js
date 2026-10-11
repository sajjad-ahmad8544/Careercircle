const r = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/skillController');

r.post('/skills', auth(), c.postSkills);
r.get('/assessment/:skill', auth(), c.getAssessmentBySkill);
r.post('/assessment/:skill', auth(), c.postAssessmentBySkill);
r.get('/gap', auth(), c.getGap);
r.put('/roadmap/:i', auth(), c.putRoadmapByI);

module.exports = r;

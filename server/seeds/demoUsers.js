// npm run seed:demo  -> ADDS demo mentors + a demo student. Nothing is deleted, your own account stays as it is.
// (password for all demo accounts: 123456). Safe to run many times.
require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const M = require('../models');
(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careercircle');
  const password = await bcrypt.hash('123456', 10);
  const demo = [
    { name: 'Riya Sharma', email: 'riya@mentor.com', role: 'mentor', headline: 'SDE-2 · Full Stack', bio: 'Helping students crack product companies.', expertise: ['React', 'Node', 'MongoDB'], rate: 500 },
    { name: 'Amit Verma', email: 'amit@mentor.com', role: 'mentor', headline: 'Senior Backend Engineer', bio: 'APIs, databases, system design.', expertise: ['Node', 'MongoDB', 'System Design'], rate: 700 },
    { name: 'Neha Gupta', email: 'neha@mentor.com', role: 'mentor', headline: 'Data Scientist · ML', bio: 'Python, ML and interview prep for data roles.', expertise: ['Python', 'Machine Learning', 'SQL'], rate: 600 },
    { name: 'Demo Student', email: 'student@demo.com', role: 'student', headline: 'Final-year CSE student', targetRole: 'Full Stack Developer' },
  ];
  let added = 0;
  for (const d of demo) {
    if (await M.User.exists({ email: d.email })) continue;
    await M.User.create({ ...d, password, mentorStatus: 'approved' });
    added++;
  }
  console.log(`✅ ${added} demo user(s) added (${demo.length - added} already existed). Login: riya@mentor.com | student@demo.com  (pw: 123456)`);
  process.exit();
})();
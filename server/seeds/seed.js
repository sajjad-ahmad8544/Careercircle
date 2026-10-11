// npm run seed  -> wipes DB and inserts demo users + jobs (password for all: 123456)
require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const M = require('../models'), jobs = require('./jobs');
(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careercircle');
  await Promise.all(Object.values(M).map(m => m.deleteMany({})));
  const password = await bcrypt.hash('123456', 10);
  await M.User.create([
    { name: 'Admin', email: 'admin@careercircle.com', password, role: 'admin' },
    { name: 'Riya Sharma', email: 'riya@mentor.com', password, role: 'mentor', headline: 'SDE-2 · Full Stack', bio: 'Helping students crack product companies.', expertise: ['React', 'Node', 'MongoDB'], rate: 500 },
    { name: 'Amit Verma', email: 'amit@mentor.com', password, role: 'mentor', headline: 'Senior Backend Engineer', bio: 'APIs, databases, system design.', expertise: ['Node', 'MongoDB', 'System Design'], rate: 700 },
    { name: 'Rohan Kapoor', email: 'rohan@mentor.com', password, role: 'mentor', mentorStatus: 'pending', headline: 'Senior Dev @ Meta', expertise: ['React'], rate: 600 },
    { name: 'Demo Student', email: 'student@demo.com', password, role: 'student', headline: 'Final-year CSE student', targetRole: 'Full Stack Developer' },
  ]);
  await M.Job.insertMany(jobs);
  console.log('🌱 Seeded. Logins: admin@careercircle.com | riya@mentor.com | student@demo.com  (pw: 123456)');
  process.exit();
})();

const r = require('express').Router();
['authRoutes','skillRoutes','mentorRoutes','jobRoutes','projectRoutes','interviewRoutes','chatRoutes','notificationRoutes','analyticsRoutes','adminRoutes'].forEach(f => r.use(require('./' + f)));
module.exports = r;

const M = require("../models");
const bcrypt = require("bcryptjs");
const { ai } = require("../utils/ai");
const { notify, award } = require("../utils/notify");
const { tok, safe } = require("../utils/token");
const { ROLES, BANK } = require("../config/constants");

exports.getAnalytics = async (req, res) => {
  const u = req.user,
    [apps, projects, sessions] = await Promise.all([
      M.Application.find({ user: u.id }),
      M.Project.countDocuments({ user: u.id }),
      M.Session.countDocuments({ $or: [{ student: u.id }, { mentor: u.id }] }),
    ]);
  const avg = (a) =>
    a.length
      ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10
      : 0;
  res.json({
    skills: avg(u.skills.map((x) => x.level)),
    mock: avg(u.mockScores),
    projects,
    sessions,
    applications: apps.length,
    status: apps.reduce(
      (o, a) => ((o[a.status] = (o[a.status] || 0) + 1), o),
      {},
    ),
    roadmap: u.roadmap.length
      ? Math.round(
          (100 * u.roadmap.filter((x) => x.done).length) / u.roadmap.length,
        )
      : 0,
    points: u.points,
    badges: u.badges,
  });
};

const M = require("../models");
const { notify, award } = require("../utils/notify");
const { esc } = require("../utils/regex");

exports.getMentors = async (req, res) => {
  const f = { role: "mentor", mentorStatus: "approved", active: { $ne: false } },
    t = req.query.q;
  if (t) {
    const re = new RegExp(esc(t), "i");
    f.$or = [{ name: re }, { expertise: re }, { headline: re }];
  }
  res.json(await M.User.find(f).select("-password -email"));
};

exports.postSessions = async (req, res) => {
  const { mentor, date, topic } = req.body;
  if (!mentor || !topic || !date || isNaN(new Date(date)))
    return res.status(400).json({ error: "Mentor, date and topic are required" });
  const m = await M.User.findOne({
    _id: mentor,
    role: "mentor",
    mentorStatus: "approved",
    active: { $ne: false },
  });
  if (!m) return res.status(400).json({ error: "This mentor is not available" });
  const se = await M.Session.create({
    mentor: m.id,
    student: req.user.id,
    date,
    topic,
  });
  await notify(m.id, `📅 New session request from ${req.user.name}`);
  res.json(se);
};

exports.getSessions = async (req, res) =>
  res.json(
    await M.Session.find({
      $or: [{ student: req.user.id }, { mentor: req.user.id }],
    })
      .populate("mentor student", "name")
      .sort("-createdAt"),
  );

// pending -> accepted | rejected,  accepted -> completed
const NEXT = { pending: ["accepted", "rejected"], accepted: ["completed"] };
exports.putSessionsById = async (req, res) => {
  const se = await M.Session.findOne({ _id: req.params.id, mentor: req.user.id });
  if (!se) return res.status(404).json({ error: "Session not found" });
  if (!(NEXT[se.status] || []).includes(req.body.status))
    return res.status(400).json({ error: `Cannot change a ${se.status} session to ${req.body.status}` });
  se.status = req.body.status;
  await se.save();
  await notify(se.student, `Your session is now: ${se.status}`);
  if (se.status === "completed") await award(se.student, 15, "Mentored");
  res.json(se);
};

exports.getReviewsByMentor = async (req, res) =>
  res.json(
    await M.Review.find({ mentor: req.params.mentor })
      .populate("student", "name")
      .sort("-createdAt"),
  );

exports.postReviews = async (req, res) => {
  const rating = Math.round(+req.body.rating),
    { mentor, comment } = req.body;
  if (!mentor || !(rating >= 1 && rating <= 5))
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  const done = await M.Session.findOne({
    mentor,
    student: req.user.id,
    status: "completed",
  });
  if (!done)
    return res.status(400).json({ error: "You can review a mentor after a completed session" });
  // one review per student per mentor (a new one replaces the old one)
  let rv = await M.Review.findOne({ mentor, student: req.user.id });
  if (rv) Object.assign(rv, { rating, comment });
  else rv = new M.Review({ mentor, student: req.user.id, rating, comment });
  const isNew = rv.isNew;
  await rv.save();
  const all = await M.Review.find({ mentor });
  await M.User.findByIdAndUpdate(mentor, {
    rating: +(all.reduce((a, b) => a + b.rating, 0) / all.length).toFixed(1),
    ratingCount: all.length,
  });
  if (isNew) {
    await notify(mentor, `⭐ ${req.user.name} rated you ${rating}/5`);
    await award(mentor, 10, all.length >= 3 ? "Top Mentor" : null);
  }
  res.json(rv);
};
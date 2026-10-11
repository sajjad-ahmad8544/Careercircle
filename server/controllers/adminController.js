const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const M = require("../models");
const { notify } = require("../utils/notify");

const badId = (id) => !mongoose.isValidObjectId(id);
const count = (o, k) => ((o[k] = (o[k] || 0) + 1), o);

// recompute a mentor's rating after reviews are added / removed
const recalc = async (mentor) => {
  const all = await M.Review.find({ mentor });
  await M.User.findByIdAndUpdate(mentor, {
    rating: all.length ? +(all.reduce((a, b) => a + b.rating, 0) / all.length).toFixed(1) : 0,
    ratingCount: all.length,
  });
};

/* ---------- dashboard numbers ---------- */
exports.getAdminStats = async (req, res) => {
  const day = 864e5,
    since = new Date(new Date().setHours(0, 0, 0, 0) - 6 * day);
  const [students, mentors, pendingMentors, admins, suspended, jobs, applications, sessions, reviews] =
    await Promise.all([
      M.User.countDocuments({ role: "student" }),
      M.User.countDocuments({ role: "mentor", mentorStatus: "approved" }),
      M.User.countDocuments({ role: "mentor", mentorStatus: "pending" }),
      M.User.countDocuments({ role: "admin" }),
      M.User.countDocuments({ active: false }),
      M.Job.countDocuments(),
      M.Application.countDocuments(),
      M.Session.countDocuments(),
      M.Review.countDocuments(),
    ]);
  const [apps, sess, recent, latest] = await Promise.all([
    M.Application.find().select("status"),
    M.Session.find().select("status"),
    M.User.find({ createdAt: { $gte: since } }).select("createdAt"),
    M.User.find().sort("-createdAt").limit(5).select("name role createdAt"),
  ]);
  // new sign-ups for the last 7 days
  const signups = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since.getTime() + i * day);
    return {
      date: d.toISOString().slice(0, 10),
      count: recent.filter((u) => u.createdAt >= d && u.createdAt < new Date(d.getTime() + day)).length,
    };
  });
  res.json({
    students, mentors, pendingMentors, admins, suspended, jobs, applications, sessions, reviews,
    applicationStatus: apps.reduce((o, a) => count(o, a.status), {}),
    sessionStatus: sess.reduce((o, s) => count(o, s.status), {}),
    signups,
    latest,
  });
};

/* ---------- users ---------- */
exports.getAdminUsers = async (req, res) =>
  res.json(await M.User.find().select("-password").sort("-createdAt"));

// change role / suspend or reactivate / set a new password
exports.putAdminUsersById = async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const u = await M.User.findById(req.params.id);
  if (!u) return res.status(404).json({ error: "User not found" });
  const { role, active, password } = req.body;
  if (u.id === req.user.id && (role !== undefined || active !== undefined))
    return res.status(400).json({ error: "You cannot change your own role or status" });
  if (role !== undefined) {
    if (!["student", "mentor", "admin"].includes(role))
      return res.status(400).json({ error: "Invalid role" });
    u.role = role;
    u.mentorStatus = "approved";
  }
  if (active !== undefined) u.active = !!active;
  if (password !== undefined) {
    if (String(password).length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    u.password = await bcrypt.hash(String(password), 10);
  }
  await u.save();
  if (role !== undefined) await notify(u.id, `Your account role was changed to ${role}.`);
  const o = u.toObject();
  delete o.password;
  res.json(o);
};

// delete a user together with everything that belongs to them
exports.deleteAdminUsersById = async (req, res) => {
  const id = req.params.id;
  if (badId(id)) return res.status(400).json({ error: "Invalid id" });
  if (id === req.user.id)
    return res.status(400).json({ error: "You cannot delete your own account" });
  const u = await M.User.findById(id);
  if (!u) return res.status(404).json({ error: "User not found" });
  const given = await M.Review.find({ student: id }).select("mentor");
  await Promise.all([
    M.Application.deleteMany({ user: id }),
    M.Session.deleteMany({ $or: [{ student: id }, { mentor: id }] }),
    M.Review.deleteMany({ $or: [{ student: id }, { mentor: id }] }),
    M.Message.deleteMany({ $or: [{ from: id }, { to: id }] }),
    M.Notification.deleteMany({ user: id }),
    M.Project.deleteMany({ user: id }),
    M.Job.updateMany({ postedBy: id }, { postedBy: null }),
  ]);
  await M.User.findByIdAndDelete(id);
  for (const m of new Set(given.map((r) => String(r.mentor)))) await recalc(m);
  res.json({ ok: 1 });
};

// approve / reject a mentor application
exports.putAdminMentorsById = async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const status = req.body.status === "approved" ? "approved" : "rejected";
  const u = await M.User.findOneAndUpdate(
    { _id: req.params.id, role: "mentor" },
    { mentorStatus: status },
    { new: true },
  );
  if (!u) return res.status(404).json({ error: "Mentor not found" });
  await notify(
    u.id,
    status === "approved"
      ? "✅ Your mentor profile was approved. Students can now book you!"
      : "Your mentor application was not approved.",
  );
  res.json({ status });
};

/* ---------- jobs / sessions / reviews ---------- */
exports.getAdminJobs = async (req, res) => {
  const [jobs, apps] = await Promise.all([
    M.Job.find().populate("postedBy", "name").sort("-createdAt"),
    M.Application.find().select("job"),
  ]);
  const n = apps.reduce((o, a) => count(o, String(a.job)), {});
  res.json(jobs.map((j) => ({ ...j.toObject(), applicants: n[j.id] || 0 })));
};

exports.getAdminSessions = async (req, res) =>
  res.json(await M.Session.find().populate("mentor student", "name").sort("-createdAt"));

exports.putAdminSessionsById = async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  if (!["pending", "accepted", "completed", "rejected", "cancelled"].includes(req.body.status))
    return res.status(400).json({ error: "Invalid status" });
  const se = await M.Session.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!se) return res.status(404).json({ error: "Session not found" });
  await notify(se.student, `Your session is now: ${se.status}`);
  await notify(se.mentor, `A session of yours is now: ${se.status}`);
  res.json(se);
};

exports.getAdminReviews = async (req, res) =>
  res.json(await M.Review.find().populate("mentor student", "name").sort("-createdAt"));

exports.deleteAdminReviewsById = async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const rv = await M.Review.findByIdAndDelete(req.params.id);
  if (rv) await recalc(rv.mentor);
  res.json({ ok: 1 });
};

/* ---------- announcements ---------- */
exports.postAdminAnnounce = async (req, res) => {
  const text = String(req.body.text || "").trim(),
    to = req.body.audience;
  if (text.length < 3 || text.length > 300)
    return res.status(400).json({ error: "Message must be 3-300 characters" });
  const f = { active: { $ne: false } };
  if (to === "student" || to === "mentor") f.role = to;
  else if (to && to !== "all") return res.status(400).json({ error: "Invalid audience" });
  const users = await M.User.find(f).select("_id");
  for (const u of users) await notify(u.id, `📢 ${text}`);
  res.json({ sent: users.length });
};
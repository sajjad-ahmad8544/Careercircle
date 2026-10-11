const M = require("../models");
const bcrypt = require("bcryptjs");
const { notify, award } = require("../utils/notify");
const { tok, safe } = require("../utils/token");
const { esc } = require("../utils/regex");

const byEmail = (email) => M.User.findOne({ email: new RegExp(`^${esc(email)}$`, "i") });

exports.postAuthRegister = async (req, res) => {
  const { name, password, role } = req.body,
    email = String(req.body.email || "").trim().toLowerCase();
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });
  if (String(password).length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  if (await byEmail(email))
    return res.status(400).json({ error: "Email already used" });
  const isAdmin =
    !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase();
  const u = await M.User.create({
    name: String(name).trim(),
    email,
    password: await bcrypt.hash(password, 10),
    role: isAdmin ? "admin" : role === "mentor" ? "mentor" : "student",
    // set AUTO_APPROVE_MENTORS=false in .env to make every new mentor wait for admin approval
    mentorStatus:
      role === "mentor" && !isAdmin && process.env.AUTO_APPROVE_MENTORS === "false"
        ? "pending"
        : "approved",
  });
  await notify(
    u.id,
    "👋 Welcome to CareerCircle! Complete your profile to get started.",
  );
  res.json({ token: tok(u), user: safe(u) });
};

exports.postAuthLogin = async (req, res) => {
  const u = await byEmail(String(req.body.email || "").trim());
  if (!u || !(await bcrypt.compare(req.body.password || "", u.password)))
    return res.status(400).json({ error: "Invalid credentials" });
  if (u.active === false)
    return res.status(403).json({ error: "Account suspended. Contact the admin." });
  res.json({ token: tok(u), user: safe(u) });
};

exports.getMe = (req, res) => res.json(safe(req.user));

exports.putMe = async (req, res) => {
  const u = req.user;
  [
    "name",
    "headline",
    "bio",
    "targetRole",
    "resume",
    "expertise",
    "rate",
  ].forEach((k) => req.body[k] !== undefined && (u[k] = req.body[k]));
  await u.save();
  // one-time reward (otherwise every save gives +20 points)
  if (u.headline && u.bio && u.resume?.summary && !u.badges.includes("Profile Pro"))
    await award(u.id, 20, "Profile Pro");
  res.json(safe(await M.User.findById(u.id)));
};
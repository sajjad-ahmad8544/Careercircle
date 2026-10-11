const M = require("../models");
const bcrypt = require("bcryptjs");
const { ai } = require("../utils/ai");
const { notify, award } = require("../utils/notify");
const { tok, safe } = require("../utils/token");
const { ROLES, BANK } = require("../config/constants");

exports.postSkills = async (req, res) => {
  const u = req.user,
    { name, level } = req.body,
    ex = u.skills.find((x) => x.name === name);
  ex ? (ex.level = +level) : u.skills.push({ name, level: +level });
  await u.save();
  res.json(safe(u));
};

exports.getAssessmentBySkill = (req, res) => {
  const b = BANK[req.params.skill];
  if (!b) return res.status(404).json({ error: "No assessment" });
  res.json(b.map(([t, o]) => ({ q: t, options: o })));
};

exports.postAssessmentBySkill = async (req, res) => {
  const b = BANK[req.params.skill],
    u = req.user;
  if (!b) return res.status(404).json({ error: "No assessment" });
  if (!Array.isArray(req.body.answers))
    return res.status(400).json({ error: "Answers required" });
  const right = b.filter((x, i) => +req.body.answers[i] === x[2]).length,
    level = Math.round((right / b.length) * 100);
  const ex = u.skills.find((x) => x.name === req.params.skill);
  ex ? (ex.level = level) : u.skills.push({ name: req.params.skill, level });
  await u.save();
  await award(u.id, 10, level === 100 ? `${req.params.skill} Master` : null);
  res.json({ right, total: b.length, level });
};

exports.getGap = async (req, res) => {
  const u = req.user,
    need = ROLES[u.targetRole] || [],
    have = (n) => (u.skills.find((x) => x.name === n) || { level: 0 }).level;
  u.gap = need.filter((n) => have(n) < 60);
  const old = new Map(u.roadmap.map((x) => [x.title, x.done]));
  u.roadmap = u.gap
    .flatMap((n) => [
      `Learn ${n} fundamentals`,
      `Build a mini project with ${n}`,
      `Retake ${n} assessment`,
    ])
    .map((t) => ({ title: t, done: old.get(t) || false }));
  await u.save();
  const advice = await ai(
    `A student targets "${u.targetRole}". Skill gaps: ${u.gap.join(", ") || "none"}. Give 4 short actionable tips.`,
    u.gap.length
      ? `Focus on: ${u.gap.join(", ")}. Practise daily and build one small project per skill.`
      : "No gaps found — start applying and take mock interviews!",
  );
  res.json({ gap: u.gap, advice, roadmap: u.roadmap });
};

exports.putRoadmapByI = async (req, res) => {
  const u = req.user,
    it = u.roadmap[req.params.i];
  if (!it) return res.status(404).end();
  it.done = !it.done;
  await u.save();
  if (u.roadmap.every((x) => x.done) && !u.badges.includes("Roadmap Finisher"))
    await award(u.id, 30, "Roadmap Finisher");
  res.json(u.roadmap);
};

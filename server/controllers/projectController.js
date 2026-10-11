const M = require("../models");
const bcrypt = require("bcryptjs");
const { ai } = require("../utils/ai");
const { notify, award } = require("../utils/notify");
const { tok, safe } = require("../utils/token");
const { ROLES, BANK } = require("../config/constants");

exports.getProjects = async (req, res) =>
  res.json(await M.Project.find({ user: req.user.id }).sort("-createdAt"));

exports.postProjects = async (req, res) => {
  const p = await M.Project.create({
    ...req.body,
    tech: String(req.body.tech || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
    user: req.user.id,
  });
  await award(req.user.id, 15, "Project Builder");
  res.json(p);
};

exports.deleteProjectsById = async (req, res) => {
  await M.Project.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json({ ok: 1 });
};

const M = require("../models");
const { notify, award } = require("../utils/notify");
const { esc } = require("../utils/regex");

const STATUSES = ["applied", "reviewing", "interview", "offered", "rejected"];

exports.getJobs = async (req, res) => {
  const f = {};
  if (req.query.type) f.type = req.query.type;
  if (req.query.q) {
    const re = new RegExp(esc(req.query.q), "i");
    f.$or = [{ title: re }, { company: re }, { skills: re }];
  }
  res.json(await M.Job.find(f).sort("-createdAt"));
};

exports.postJobs = async (req, res) => {
  const { title, company } = req.body;
  if (!title || !company)
    return res.status(400).json({ error: "Title and company are required" });
  res.json(
    await M.Job.create({
      title,
      company,
      type: req.body.type === "internship" ? "internship" : "job",
      location: req.body.location,
      description: req.body.description,
      skills: String(req.body.skills || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      postedBy: req.user.id,
    }),
  );
};

exports.deleteJobsById = async (req, res) => {
  await M.Job.findByIdAndDelete(req.params.id);
  await M.Application.deleteMany({ job: req.params.id });
  res.json({ ok: 1 });
};

exports.postApplyByJob = async (req, res) => {
  if (!(await M.Job.exists({ _id: req.params.job })))
    return res.status(404).json({ error: "Job not found" });
  if (await M.Application.findOne({ job: req.params.job, user: req.user.id }))
    return res.status(400).json({ error: "Already applied" });
  const a = await M.Application.create({
    job: req.params.job,
    user: req.user.id,
  });
  await award(req.user.id, 5, "Go-Getter");
  res.json(a);
};

// student -> own applications | admin -> everything | mentor -> applicants of the jobs they posted
// ?mine=1 always returns the logged-in user's own applications (used by Analytics)
exports.getApplications = async (req, res) => {
  let f = { user: req.user.id };
  if (!req.query.mine) {
    if (req.user.role === "admin") f = {};
    else if (req.user.role === "mentor") {
      const ids = (await M.Job.find({ postedBy: req.user.id }).select("_id")).map((j) => j.id);
      f = { job: { $in: ids } };
    }
  }
  res.json(
    await M.Application.find(f)
      .populate("job", "title company")
      .populate("user", "name email")
      .sort("-createdAt"),
  );
};

exports.putApplicationsById = async (req, res) => {
  if (!STATUSES.includes(req.body.status))
    return res.status(400).json({ error: "Invalid status" });
  const a = await M.Application.findById(req.params.id).populate("job", "title postedBy");
  if (!a) return res.status(404).json({ error: "Application not found" });
  if (req.user.role !== "admin" && String(a.job?.postedBy) !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });
  a.status = req.body.status;
  await a.save();
  await notify(
    a.user,
    `📋 Your application for ${a.job?.title} is now: ${a.status}`,
  );
  res.json(a);
};
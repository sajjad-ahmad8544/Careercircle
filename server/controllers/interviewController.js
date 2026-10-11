const { ai } = require("../utils/ai");
const { award } = require("../utils/notify");

exports.getInterview = (req, res) =>
  res.json([
    `Why do you want to become a ${req.query.role}?`,
    "Tell me about yourself.",
    "Explain a project you built and your role in it.",
    "How do you debug a problem in production?",
    "Explain what a REST API is.",
  ]);

exports.postInterview = async (req, res) => {
  const { question, answer } = req.body,
    words = (answer || "").trim().split(/\s+/).filter(Boolean).length;
  if (!words) return res.status(400).json({ error: "Answer is empty" });
  let out = {
    score: Math.min(10, Math.round(words / 8) + 2),
    feedback:
      words < 25
        ? "Too short. Add examples and results (STAR method)."
        : "Good structure. Add measurable outcomes to stand out.",
  };
  const txt = await ai(
    `Score this interview answer 1-10 with one-line feedback. Reply ONLY JSON {"score":n,"feedback":"..."}.\nQ: ${question}\nA: ${answer}`,
    null,
  );
  try {
    if (txt) {
      const j = JSON.parse(txt.replace(/```json|```/g, "").trim());
      const sc = Math.round(+j.score);
      if (sc >= 1 && sc <= 10 && j.feedback) out = { score: sc, feedback: j.feedback };
    }
  } catch {}
  req.user.mockScores.push(out.score);
  await req.user.save();
  if (out.score >= 7) await award(req.user.id, 10, "Interview Ready");
  res.json(out);
};
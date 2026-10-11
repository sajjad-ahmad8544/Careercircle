const M = require("../models");
const { esc } = require("../utils/regex");

// everyone except me and suspended users
exports.getPeople = async (req, res) =>
  res.json(
    await M.User.find({
      _id: { $ne: req.user.id },
      active: { $ne: false },
    })
      .select("name role headline")
      .sort("name"),
  );

exports.getMessagesByUid = async (req, res) =>
  res.json(
    await M.Message.find({
      $or: [
        { from: req.user.id, to: req.params.uid },
        { from: req.params.uid, to: req.user.id },
      ],
    }).sort("createdAt"),
  );

// shared by the socket handler and the REST fallback
exports.saveMessage = async (from, to, text) => {
  text = String(text || "").trim().slice(0, 1000);
  if (!text || !to || String(to) === String(from)) return null;
  if (!(await M.User.exists({ _id: to, active: { $ne: false } }))) return null;
  return M.Message.create({ from, to: String(to), text });
};

// REST fallback (used by the client when the websocket is not connected)
exports.postMessagesByUid = async (req, res) => {
  const m = await exports.saveMessage(req.user.id, req.params.uid, req.body.text);
  if (!m) return res.status(400).json({ error: "Message could not be sent" });
  require("../socket").getIO()?.to(m.to).to(m.from).emit("msg", m);
  res.json(m);
};
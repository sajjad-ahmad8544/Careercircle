const jwt = require("jsonwebtoken");
const M = require("./models");
const { SECRET } = require("./config/env");
let io;

exports.init = (srv) => {
  io = require("socket.io")(srv, { cors: { origin: "*" } });
  io.on("connection", (so) => {
    so.on("join", (t) => {
      try {
        so.uid = jwt.verify(t, SECRET).id;
        so.join(so.uid);
      } catch {}
    });
    so.on("msg", async ({ to, text } = {}) => {
      if (!so.uid) return;
      try {
        const m = await require("./controllers/chatController").saveMessage(so.uid, to, text);
        if (m) io.to(m.to).to(so.uid).emit("msg", m);
      } catch (e) {
        console.error("chat error:", e.message);
      }
    });
  });
  return io;
};
exports.getIO = () => io;
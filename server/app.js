const express = require("express"),
  cors = require("cors"),
  path = require("path"),
  fs = require("fs");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error");
const app = express();
app.use(cors(), express.json());
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", routes);

// Production: serve the built React app (client/dist) from the same server
const dist = path.join(__dirname, "../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) =>
    req.method === "GET" && !req.path.startsWith("/api")
      ? res.sendFile(path.join(dist, "index.html"))
      : next(),
  );
}
app.use(notFound, errorHandler);
module.exports = app;

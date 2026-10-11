require("dotenv").config();
const http = require("http");
const app = require("./app"),
  connectDB = require("./config/db"),
  { init } = require("./socket");
const M = require("./models"),
  jobs = require("./seeds/jobs");

const srv = http.createServer(app);
init(srv);
connectDB()
  .then(async () => {
    if (!(await M.Job.countDocuments())) await M.Job.insertMany(jobs);
    const port = process.env.PORT || 5000;
    srv.listen(port, () =>
      console.log(`CareerCircle API running on :${port}`),
    );
  })
  .catch((e) => {
    console.error(" DB error:", e.message);
    process.exit(1);
  });

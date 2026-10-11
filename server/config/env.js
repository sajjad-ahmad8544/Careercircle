// Read lazily so dotenv (loaded in server.js) is applied first
module.exports = { SECRET: process.env.JWT_SECRET || "dev-secret" };

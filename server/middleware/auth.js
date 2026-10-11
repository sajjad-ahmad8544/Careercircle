const jwt = require("jsonwebtoken");
const M = require("../models");
const { SECRET } = require("../config/env");

// auth()            -> any logged-in user
// auth(['admin'])   -> only listed roles
exports.auth = (roles) => async (req, res, next) => {
  try {
    const { id } = jwt.verify(
      (req.headers.authorization || "").slice(7),
      SECRET,
    );
    req.user = await M.User.findById(id);
    if (!req.user) throw new Error("no user");
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.user.active === false)
    return res.status(403).json({ error: "Account suspended" });
  if (roles && !roles.includes(req.user.role))
    return res.status(403).json({ error: "Forbidden" });
  next();
};
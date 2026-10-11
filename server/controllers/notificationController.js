const M = require("../models");
const bcrypt = require("bcryptjs");
const { ai } = require("../utils/ai");
const { notify, award } = require("../utils/notify");
const { tok, safe } = require("../utils/token");
const { ROLES, BANK } = require("../config/constants");

exports.getNotifications = async (req, res) =>
  res.json(
    await M.Notification.find({ user: req.user.id })
      .sort("-createdAt")
      .limit(50),
  );

exports.putNotificationsRead = async (req, res) => {
  await M.Notification.updateMany({ user: req.user.id }, { read: true });
  res.json({ ok: 1 });
};

const M = require('../models');
const { getIO } = require('../socket');

exports.notify = async (user, text) => {
  const n = await M.Notification.create({ user, text });
  getIO()?.to(String(user)).emit('notif', n);
};

// add points and (optionally) a badge
exports.award = async (uid, pts, badge) => {
  const u = await M.User.findById(uid); if (!u) return;
  u.points += pts;
  if (badge && !u.badges.includes(badge)) { u.badges.push(badge); await exports.notify(uid, `🏆 New badge unlocked: ${badge}`); }
  await u.save();
};

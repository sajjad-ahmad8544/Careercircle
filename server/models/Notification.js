const m = require('mongoose'), S = m.Schema, id = S.Types.ObjectId;
module.exports = m.model('Notification', new S({ user: id, text: String, read: { type: Boolean, default: false } }, { timestamps: true }));

const m = require('mongoose'), S = m.Schema, id = S.Types.ObjectId;
module.exports = m.model('Session', new S({ mentor: { type: id, ref: 'User' }, student: { type: id, ref: 'User' }, date: Date, topic: String, status: { type: String, default: 'pending' } }, { timestamps: true }));

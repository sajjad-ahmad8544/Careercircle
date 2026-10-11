const m = require('mongoose'), S = m.Schema, id = S.Types.ObjectId;
module.exports = m.model('Review', new S({ mentor: id, student: { type: id, ref: 'User' }, rating: Number, comment: String }, { timestamps: true }));

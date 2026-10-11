const m = require('mongoose'), S = m.Schema, id = S.Types.ObjectId;
module.exports = m.model('Message', new S({ from: String, to: String, text: String }, { timestamps: true }));

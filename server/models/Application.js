const m = require('mongoose'), S = m.Schema, id = S.Types.ObjectId;
module.exports = m.model('Application', new S({ job: { type: id, ref: 'Job' }, user: { type: id, ref: 'User' }, status: { type: String, default: 'applied' } }, { timestamps: true }));

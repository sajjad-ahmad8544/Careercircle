const m = require('mongoose'), S = m.Schema, id = S.Types.ObjectId;
module.exports = m.model('Project', new S({ user: id, title: String, description: String, link: String, tech: [String] }, { timestamps: true }));

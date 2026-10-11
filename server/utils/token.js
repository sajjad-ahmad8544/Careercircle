const jwt = require('jsonwebtoken');
const { SECRET } = require('../config/env');
exports.tok = u => jwt.sign({ id: u.id }, SECRET, { expiresIn: '7d' });
exports.safe = u => { const o = u.toObject(); delete o.password; return o; };

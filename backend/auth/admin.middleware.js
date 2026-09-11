const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = async function adminWrites(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const token = req.headers.authorization?.replace(/^Bearer /, '') || req.cookies?.authToken;
    if (!token) return res.status(401).json({ message: 'Please log in.' });
    let decoded;
    try {
        if (!process.env.JWT_SECRET) throw new Error('Missing secret');
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch { return res.status(401).json({ message: 'Please log in again.' }); }
    try {
        const user = (await pool.query('SELECT isadmin FROM users WHERE id=$1', [decoded.userId])).rows[0];
        if (!user?.isadmin) return res.status(403).json({ message: 'Administrator access required.' });
        next();
    } catch { res.status(503).json({ message: 'Unable to verify access. Please try again.' }); }
};

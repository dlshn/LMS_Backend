const { verifyAccessToken } = require('../utils/token');

function requireStudentAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    if (decoded.type !== 'student') {
      return res.status(403).json({ error: 'This route is for students only' });
    }
    req.student = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireStudentAuth };
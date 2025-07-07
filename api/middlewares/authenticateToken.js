const jwt = require('jsonwebtoken');
const secretKey = 'charisma83743990!!!';


function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token not provided' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden - Invalid token' });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
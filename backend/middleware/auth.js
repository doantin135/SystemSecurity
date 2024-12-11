const { admin } = require('../config/firebaseAdmin');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'hsuuniversity';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("Authorization Header:", authHeader);
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader;

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!decoded.uid) {
      return res.status(400).json({ message: 'Token is missing required fields' });
    }

    try {
      const userDoc = await admin.firestore()
        .collection('Users')
        .doc(decoded.uid)
        .get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }

      req.user = {
        ...decoded,
        ...userDoc.data(),
      };
      next();
    } catch (error) {
      console.error('Error retrieving user:', error);
      if (error.code === 'unavailable') {
        return res.status(503).json({ message: 'Firestore service unavailable' });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(500).json({ message: 'Roles configuration error' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };
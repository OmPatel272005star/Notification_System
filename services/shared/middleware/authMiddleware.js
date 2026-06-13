import jwt    from 'jsonwebtoken';
import { redis } from '../config/redis.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];

    // Redis JWT blocklist check (Phase 3)
    const isBlocked = await redis.get(`blocked:${token}`);
    if (isBlocked) return res.status(401).json({ message: 'Token revoked. Please log in again.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user  = decoded;
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export { authMiddleware };

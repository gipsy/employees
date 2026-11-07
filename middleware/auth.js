import jwt from 'jsonwebtoken';
import prismadb from '../lib/prismadb.js';

const auth = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  const token =
    authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (!process.env.ACCESS_SECRET_KEY) {
    return res.status(503).json({ message: 'Service unavailable' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY);
    const user = await prismadb.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

export default auth;

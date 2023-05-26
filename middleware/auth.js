import jwt from 'jsonwebtoken';
import prismadb from '../lib/prismadb.js'

const auth = async (req, res, next) => {
  console.log('auth')
  try {
    const token = req.headers.authorization?.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    console.log('id',decoded.id)
    const user = await prismadb.user.findUnique({
      where: {
        id: decoded.id
      }
    });
    console.log('user',user);

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({message: "Not authorized", error});
  }
}

export default auth;

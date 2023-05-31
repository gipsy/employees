import jwt from 'jsonwebtoken';
import prismadb from '../lib/prismadb.js'

const auth = async (req, res, next) => {
  try {
    // const token = req.headers.authorization?.split(' ')[1];
    const token = req.cookies.access_token
    console.log('access_token',token)

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prismadb.user.findUnique({
      where: {
        id: decoded.id
      }
    });

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({message: "Not authorized", error});
  }
}

export default auth;

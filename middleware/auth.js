import jwt from 'jsonwebtoken';
import prismadb from '../lib/prismadb.js'

const auth = async (req, res, next) => {
  let token;

  const withAuthorization = !!req.headers?.authorization;
  token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

  console.log(withAuthorization)
  if (token) {
    try {
      // const token = req.headers.authorization?.split(' ')[1];

      console.log('token',token)
      const decoded = jwt.verify(token, withAuthorization
        ? process.env.ACCESS_SECRET_KEY
        : process.env.REFRESH_SECRET_KEY
      );

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
  } else {
    res.status(401);
    // throw new Error('Not authorized, no token');
  }
}

export default auth;

import prismadb from "../lib/prismadb.js";
import jwt from "jsonwebtoken";

/**
 * @route /api/refresh
 * @desc Refresh token
 * @access Private
 */
export const refresh = async (req, res) => {
  const accessSecret = process.env.ACCESS_SECRET_KEY
  const refreshSecret = process.env.REFRESH_SECRET_KEY

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  const foundUser = await prismadb.user.findFirst({
    where: {
      refreshToken: {
        has: refreshToken
      }
    }
  });

  // Detected refresh token reuse!
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      refreshSecret,
      async (err, decoded) => {
        console.log('Detected refresh token reuse', err)
        if (err) return res.sendStatus(403); //Forbidden
        const hackedUser = await prismadb.user.findFirst({
          where: {
            email: decoded.email
          }
        });
        hackedUser.refreshToken = [];
        const result = await prismadb.user.update({
          where: {
            id: foundUser.id
          },
          data: {...hackedUser}
        }

        );
        console.log(result);
      }
    )
    return res.sendStatus(403); //Forbidden
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

  // evaluate jwt
  jwt.verify(
    refreshToken,
    refreshSecret,
    async (err, decoded) => {
      if (err) {
        console.log('expired refresh token');
        foundUser.refreshToken = [...newRefreshTokenArray];
        const result = await prismadb.user.update({
          where: {
            id: foundUser.id
          },
          data: {
            email: foundUser.email,
            name: foundUser.name,
            password: foundUser.password,
            refreshToken: foundUser.refreshToken
          }
        });
      }
      if (err || foundUser.id !== decoded.id) return res.sendStatus(403)

      // Refresh token was still valid
      const accessToken = jwt.sign(
        { id: foundUser.id }, accessSecret,
        { expiresIn: "10m" }
      )

      const newRefreshToken = jwt.sign(
        { id: foundUser.id }, refreshSecret,
        { expiresIn: '1d' }
      );
      // Saving refreshToken with current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await prismadb.user.update({
        where: {
          id: foundUser.id
        },
        data: {
          email: foundUser.email,
          name: foundUser.name,
          password: foundUser.password,
          refreshToken: foundUser.refreshToken
        }
      });
      console.log(result);

      // Creates Secure Cookie with refresh token
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000
      });

      // Send authorization roles and access token to user
      res.json({ accessToken })
    }
  )
}


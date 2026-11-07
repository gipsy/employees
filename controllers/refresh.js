import prismadb from "../lib/prismadb.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  sameSite: 'None',
  secure: true,
};

/**
 * @route /api/refresh
 * @desc Refresh token
 * @access Private
 */
export const refresh = async (req, res) => {
  const accessSecret = process.env.ACCESS_SECRET_KEY;
  const refreshSecret = process.env.REFRESH_SECRET_KEY;

  if (!accessSecret || !refreshSecret) {
    return res.sendStatus(503);
  }

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', cookieOptions);

  const foundUser = await prismadb.user.findFirst({
    where: {
      refreshToken: {
        has: refreshToken,
      },
    },
  });

  if (!foundUser) {
    try {
      const decoded = jwt.verify(refreshToken, refreshSecret);
      await prismadb.user.update({
        where: { id: decoded.id },
        data: { refreshToken: [] },
      });
    } catch {
      // Token invalid; nothing to revoke.
    }
    return res.sendStatus(403);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, refreshSecret);
  } catch {
    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (rt) => rt !== refreshToken
    );
    await prismadb.user.update({
      where: { id: foundUser.id },
      data: { refreshToken: newRefreshTokenArray },
    });
    return res.sendStatus(403);
  }

  if (foundUser.id !== decoded.id) {
    return res.sendStatus(403);
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  const accessToken = jwt.sign({ id: foundUser.id }, accessSecret, {
    expiresIn: '10m',
  });
  const newRefreshToken = jwt.sign({ id: foundUser.id }, refreshSecret, {
    expiresIn: '1d',
  });

  await prismadb.user.update({
    where: { id: foundUser.id },
    data: {
      refreshToken: [...newRefreshTokenArray, newRefreshToken],
    },
  });

  res.cookie('jwt', newRefreshToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
};

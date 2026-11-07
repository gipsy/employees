import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prismadb from "../lib/prismadb.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
};

function publicUser(user) {
  const { password, refreshToken, ...safe } = user;
  return safe;
}

/**
 * @route POST /api/user/login
 * @desc Login
 * @access Public
 */
export const login = async ( req, res ) => {
  try {
    const cookies = req.cookies;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in required fields" });
    }

    const user = await prismadb.user.findFirst({
      where: {
        email,
      }
    })

    const isPasswordCorrect = user && (await bcrypt.compare(password, user?.password));

    const accessSecret = process.env.ACCESS_SECRET_KEY
    const refreshSecret = process.env.REFRESH_SECRET_KEY

    if (user && isPasswordCorrect && accessSecret && refreshSecret) {
      const accessToken = jwt.sign({ id: user.id }, accessSecret,
        { expiresIn: "10m" }
      )
      const newRefreshToken = jwt.sign({ id: user.id }, refreshSecret,
        { expiresIn: "1d" }
      )

      let newRefreshTokenArray = !cookies?.jwt
        ? user.refreshToken
        : user.refreshToken.filter(rt => rt !== cookies.jwt);

      if (cookies?.jwt) {
        const refreshToken = cookies.jwt;
        const foundToken = await prismadb.user.findFirst({
          where: {
            refreshToken: {
              has: refreshToken
            }
          }
        });

        if (!foundToken) {
          newRefreshTokenArray = [];
        }

        res.clearCookie('jwt', cookieOptions);
      }

      await prismadb.user.update({
        data: {
          refreshToken: [...newRefreshTokenArray, newRefreshToken],
        },
        where: {
          id: user.id,
        }
      });

      res.cookie('jwt', newRefreshToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    } else {
      res.status(400).json({ message: "Incorrect users or password." });
    }
  } catch {
    res.status(500).json({ message: "Something went wrong."});
  }
};

/**
 * @route POST /api/user/register
 * @desc Register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Please fill in required fields" });
    }

    const registeredUser = await prismadb.user.findFirst({
      where: {
        email,
      }
    });

    if (registeredUser) {
      return res.status(409).json({ message: "User with this email already registered." })
    };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prismadb.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    })

    const accessSecret = process.env.ACCESS_SECRET_KEY

    if (user && accessSecret) {
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
      })
    } else {
      return res.status(400).json({ message: "Create user not success." });
    }
  } catch {
    res.status(500).json({ message: "Something went wrong." });
  }
};


/**
 *
 * @route GET /api/user/current
 * @desc Current user
 * @access Private
 */
export const current = async (req, res) => {
  return res.status(200).json(publicUser(req.user));
};

/**
 *
 * @route POST /api/user/logout
 * @desc Logout user
 * @access Public (session ended via refresh cookie)
 */
export const logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;

  const foundUser = await prismadb.user.findFirst({
    where: {
      refreshToken: {
        has: refreshToken
      }
    }
  });
  if (!foundUser) {
    res.clearCookie('jwt', cookieOptions);
    return res.sendStatus(204);
  }

  const remaining = foundUser.refreshToken.filter(rt => rt !== refreshToken);
  await prismadb.user.update({
    where: {
      id: foundUser.id,
    },
    data: {
      refreshToken: remaining,
    }
  });

  res.clearCookie('jwt', cookieOptions);
  res.sendStatus(204);
}

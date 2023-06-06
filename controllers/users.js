import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prismadb from "../lib/prismadb.js";

/**
 * @route POST /api/user/login
 * @desc Login
 * @access Public
 */
export const login = async ( req, res ) => {
  try {
    const cookies = req.cookies;
    console.log(`cookies available at login: ${JSON.stringify(cookies)}`);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in required fields" });
    }

    const user = await prismadb.user.findFirst({
      where: {
        email,
      }
    })

    // evaluate password
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

      // Changed to let keyword
      let newRefreshTokenArray = !cookies?.jwt
        ? user.refreshToken
        : user.refreshToken.filter(rt => rt !== cookies.jwt);

      if (cookies?.jwt) {
        // Scenario added here:
        //   1) User logs in but never uses RT and does not logout
        //   2) RT is stolen
        //   3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
        const refreshToken = cookies.jwt;
        const foundToken = await prismadb.user.findFirst({
          where: {
            refreshToken: {
              has: refreshToken
            }
          }
        });

        // Detected refresh token reuse!
        if (!foundToken) {
          console.log('attempted refresh token reuse at login!');
          // clear out ALL previous refresh tokens
          newRefreshTokenArray = [];
        }

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
      }

      // Saving refreshToken with current user
      user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await prismadb.user.update({
        data: {
          refreshToken: user.refreshToken
        },
        where: {
          id: user.id,
        }
      });
      console.log(result);

      // Creates Secure Cookie with refresh token
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Send authorization roles and access token to user
      res.json({ accessToken });
    } else {
      res.status(400).json({ message: "Incorrect users or password." });
    }
  } catch (error) {
    console.log(error)
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
      res.status(400).json({ message: "Please fill in required fields" });
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

    console.log(user);

    const accessSecret = process.env.ACCESS_SECRET_KEY

    if (user && accessSecret) {
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        // accessToken: jwt.sign({ id: user.id }, accessSecret,
        //   { expiresIn: "2m" }
        // ),
        // refreshToken: jwt.sign({ id: user.id }, refreshSecret,
        //   { expiresIn: "1d",
        // })
      })
    } else {
      return res.status(400).json({ message: "Create user not success." });
    }
  } catch (error) {
    console.log(error)
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
  return res.status(200).json(req.user);
};

/**
 *
 * @route GET /api/user/logout
 * @desc Logout user
 * @access Private
 */
export const logout = async (req, res) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await prismadb.user.findFirst({
    where: {
      refreshToken: {
        has: refreshToken
      }
    }
  });
  if (!foundUser) {
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);
  const result = await prismadb.user.update({
    where: {
      id: foundUser.id,
    },
    data: {
      email: foundUser.email,
      name: foundUser.name,
      password: foundUser.password,
      refreshToken: foundUser.refreshToken
    }
  });
  console.log(result);

  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.sendStatus(204);
}

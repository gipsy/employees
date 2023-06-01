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
    console.log(req.cookies)
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

    const accessToken = jwt.sign({ id: user.id }, accessSecret,
      { expiresIn: "2m" }
    )
    if (user && isPasswordCorrect && accessSecret && refreshSecret) {
      res.set(
        {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': req.headers.origin,
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
          'Access-Control-Expose-Headers': 'Content-Type',
        }
      ).cookie( 'access_token', accessToken, {
        httpOnly: true,
        // path: '/',
        maxAge: 120000,
        domain: 'localhost',
        sameSite: 'none',
        secure: true
      } )
      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        // accessToken: jwt.sign({ id: user.id }, accessSecret,
        //   { expiresIn: "2m" }
        // ),
        // refreshToken: jwt.sign({ id: user.id }, refreshSecret,
        //   { expiresIn: "10m",
        // })
      })
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
      return res.status(400).json({ message: "User with this email already registered." })
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
      // res.set(
      //   {
      //     'Access-Control-Allow-Credentials': true,
      //     'Access-Control-Allow-Origin': req.headers.origin,
      //     'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      //     'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
      //     'Access-Control-Expose-Headers': 'Content-Type',
      //   }
      // ).cookie( 'access_token', accessToken, {
      //   httpOnly: true,
      //   path: 'auth/',
      //   maxAge: 120000,
      //   domain: 'localhost',
      //   sameSite: 'none',
      //   secure: true
      // } )
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        // accessToken: jwt.sign({ id: user.id }, accessSecret,
        //   { expiresIn: "2m" }
        // ),
        // refreshToken: jwt.sign({ id: user.id }, refreshSecret,
        //   { expiresIn: "10m",
        // })
      })
      // res.status(201).json({
      //   id: user.id,
      //   email: user.email,
      //   name: user.name,
      //   accessToken: jwt.sign({ id: user.id }, accessSecret, { expiresIn: '2m' }),
      //   refreshToken: jwt.sign({ id: user.id }, refreshSecret, { expiresIn: '10m' })
      // })
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
 * @route /api/refresh
 * @desc Refresh token
 * @access Private
 */
export const handleRefreshToken = async (req, res) => {
  const accessSecret = process.env.ACCESS_SECRET_KEY
  const refreshSecret = process.env.REFRESH_SECRET_KEY

  const cookies = req.cookies;
  if (!cookies?.access_token) return res.sendStatus(401);
  const refreshToken = cookies.access_token;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  const foundUser = await prismadb.user.findFirst({
    where: {
      refreshToken,
    }
  });

  // Detected refresh token reuse!
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      refreshSecret,
      async (err, decoded) => {
        if (err) return res.sendStatus(403); //Forbidden
        const hackedUser = await prismadb.user.findFirst({
          where: {
            email: decoded.email
          }
        });
        hackedUser.refreshToken = [];
        const result = await prismadb.user.create(hackedUser);
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
        foundUser.refreshToken = [...newRefreshTokenArray];
        const result = await prismadb.user.create(foundUser);
      }
      if (err || foundUser.email !== decoded.email) return res.sendStatus(403)

      // Refresh token was still valid
      const accessToken = jwt.sign(
        {
          foundUser
        },
        accessSecret, { expiresIn: '10s' }
      );

      const newRefreshToken = jwt.sign(
        { 'username': foundUser.email },
        refreshSecret, { expiresIn: '1d' }
      );
      // Saving refreshToken with current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await prismadb.user.create(foundUser);
      console.log(result);

      // Creates Secure Cookie with refresh token
      res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

      // Send authorization roles and access token to user
      res.json({ accessToken })
    }
  )
}

/**
 *
 * @route GET /api/user/logout
 * @desc Logout user
 * @access Private
 */
export const logout = async(req, res) => {
  res.clearCookie('access_token');
  res.status(200).json('Logout success');
}

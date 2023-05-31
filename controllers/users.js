import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prismadb from "../lib/prismadb.js";

/**
 * @route POST /api/user/login
 * @desc Login
 * @access Public
 */
export const login = async ( req, res, next) => {
  try {
    console.log(req.cookies)
    console.log(req.body)
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
      console.log(req.headers.origin)
      res.set(
        {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': req.headers.origin,
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
          // 'Access-Control-Expose-Headers': 'Content-Type',
        }
      ).cookie( 'access_token', accessToken, {
        httpOnly: true,
        path: '/',
        maxAge: 120000,
        domain: 'localhost',
        sameSite: 'none',
        secure: true
      } )
      // .status( 200 ).json( {
      //   // id: user.id,
      //   email: user.email,
      //   name: user.name,
      // } )
      // intercept OPTIONS method
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
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        accessToken: jwt.sign({ id: user.id }, accessSecret, { expiresIn: '2m' }),
        refreshToken: jwt.sign({ id: user.id }, refreshSecret, { expiresIn: '10m' })
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
export const logout = async(req, res) => {
  res.clearCookie('access_token');
  res.status(200).json('Logout success');
}

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prismadb from "../lib/prismadb.js";

/**
 * @route POST /api/user/login
 * @desc Login
 * @access Public
 */
export const login = async ( req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Please fill in required fields" });
    }

    const user = await prismadb.user.findFirst({
      where: {
        email,
      }
    })

    const isPasswordCorrect = user && (await bcrypt.compare(password, user?.password));

    const secret = process.env.JWT_SECRET_KEY

    if (user && isPasswordCorrect && secret) {
      res.status(200).json({
        id: user.id,
        email: user.email,
        name: user.name,
        token: jwt.sign({ id: user.id }, secret, { expiresIn: "30d" }),
      })
    } else {
      return res.status(400).json({ message: "Incorrect users or password." });
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
    console.log(user)

    const secret = process.env.JWT_SECRET_KEY

    if (user && secret) {
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        token: jwt.sign({ id: user.id }, secret, { expiresIn: '30d' })
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

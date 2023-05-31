import prismadb from "../lib/prismadb.js";

/**
 * @route GET /api/employees
 * @desc get all employees
 * @access Private
 */
export const all = async (req, res) => {
  try {
    const employees = await prismadb.employee.findMany();

    res.status(200).json(employees)
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: 'Cannot get all employees' });

  }
}

/**
 * @route POST /api/employees/add
 * @desc Add employee
 * @access Private
 */
export const add = async (req, res) => {
  try {
    const { firstName, lastName, address, age } = req.body;

    console.log('body',req.body)
    if (!firstName || !lastName || !address || !age) {
      res.status(400).json({ message: 'All fields must be provided'});
    }

    const employee = await prismadb.employee.create({
      data: {
        firstName,
        lastName,
        address,
        age,
        userId: req.user.id,
      }
    });
    return res.status(201).json(employee);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
}

/**
 * @route POST /api/employees/remove/:id
 * @desc Remove employee
 * @access Private
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    await prismadb.employee.delete({
      where: {
        id
      }
    });

    res.status(204).json('OK')
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Not able to remove employee" });
  }
}

/**
 * @route PUT /api/employees/edit/:id
 * @desc Edit employee
 * @access Private
 */
export const edit = async (req, res) => {
  try {
    const data = req.body;
    const { id } = req.params;

    await prismadb.employee.update({
      where: {
        id
      },
      data
    })

    res.status(204).json('OK')
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Not able to edit employee" });
  }
}

/**
 * @route GET /api/employees/:id
 * @desc Get employee
 * @access Private
 */
export const employee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prismadb.employee.findUnique({
      where: {
        id
      }
    })

    res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json({ message: "Not able to get employee" });
  }
}

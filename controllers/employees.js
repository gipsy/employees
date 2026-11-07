import prismadb from "../lib/prismadb.js";

const EMPLOYEE_FIELDS = ["firstName", "lastName", "address", "age"];

function pickEmployeeData(body) {
  const data = {};
  for (const key of EMPLOYEE_FIELDS) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }
  return data;
}

/**
 * @route GET /api/employees
 * @desc get all employees
 * @access Private
 */
export const all = async (req, res) => {
  try {
    const employees = await prismadb.employee.findMany({
      where: { userId: req.user.id },
    });

    res.status(200).json(employees);
  } catch {
    res.status(400).json({ message: "Cannot get all employees" });
  }
};

/**
 * @route POST /api/employees/add
 * @desc Add employee
 * @access Private
 */
export const add = async (req, res) => {
  try {
    const { firstName, lastName, address, age } = req.body;

    if (!firstName || !lastName || !address || !age) {
      return res
        .status(400)
        .json({ message: "All fields must be provided" });
    }

    const employee = await prismadb.employee.create({
      data: {
        firstName,
        lastName,
        address,
        age,
        userId: req.user.id,
      },
    });
    return res.status(201).json(employee);
  } catch {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

/**
 * @route POST /api/employees/remove/:id
 * @desc Remove employee
 * @access Private
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prismadb.employee.deleteMany({
      where: { id, userId: req.user.id },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.sendStatus(204);
  } catch {
    return res.status(500).json({ message: "Not able to remove employee" });
  }
};

/**
 * @route PATCH /api/employees/update
 * @desc Edit employees collection
 * @access Private
 */
export const update = async (req, res) => {
  try {
    const employeeQueries = req.body;

    for (const id of Object.keys(employeeQueries)) {
      const data = pickEmployeeData(employeeQueries[id]);
      if (Object.keys(data).length === 0) {
        continue;
      }

      const updated = await prismadb.employee.updateMany({
        where: { id, userId: req.user.id },
        data,
      });

      if (updated.count === 0) {
        return res.status(404).json({ message: `Employee not found: ${id}` });
      }
    }

    res.sendStatus(204);
  } catch {
    return res.status(500).json({ message: "Not able to edit employees" });
  }
};

/**
 * @route PUT /api/employees/edit/:id
 * @desc Edit employee
 * @access Private
 */
export const edit = async (req, res) => {
  try {
    const data = pickEmployeeData(req.body);
    const { id } = req.params;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await prismadb.employee.updateMany({
      where: { id, userId: req.user.id },
      data,
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.sendStatus(204);
  } catch {
    return res.status(500).json({ message: "Not able to edit employee" });
  }
};

/**
 * @route GET /api/employees/:id
 * @desc Get employee
 * @access Private
 */
export const employee = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prismadb.employee.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!record) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(record);
  } catch {
    return res.status(500).json({ message: "Not able to get employee" });
  }
};

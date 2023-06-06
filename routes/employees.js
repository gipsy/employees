import express from 'express';
import { all, employee, add, edit, update, remove } from '../controllers/employees.js'
import auth from '../middleware/auth.js';

const router = express.Router();

router.get("/", auth, all);
router.get("/:id", auth, employee);
router.post("/add", auth, add);
router.post("/remove/:id", auth, remove);
router.put("/edit/:id", auth, edit);
router.patch("/update", auth, update);

export default router;

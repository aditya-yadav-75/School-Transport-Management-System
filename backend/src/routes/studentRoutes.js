import express from "express";
import { getStudents } from "../controllers/studentController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, adminOnly, getStudents);

export default router;

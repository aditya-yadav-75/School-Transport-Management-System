import express from "express";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
  getMyAssignment,
  getRouteStudents
} from "../controllers/assignmentController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/mine", protect, getMyAssignment);
router.get("/", protect, adminOnly, getAssignments);
router.get("/route/:id/students", protect, adminOnly, getRouteStudents);
router.post("/", protect, adminOnly, createAssignment);
router.delete("/:id", protect, adminOnly, deleteAssignment);

export default router;

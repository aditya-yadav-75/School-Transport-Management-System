import express from "express";
import {
  createRoute,
  deleteRoute,
  getRoute,
  getRoutes,
  updateRoute
} from "../controllers/routeController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getRoutes);
router.get("/:id", protect, getRoute);
router.post("/", protect, adminOnly, createRoute);
router.put("/:id", protect, adminOnly, updateRoute);
router.delete("/:id", protect, adminOnly, deleteRoute);

export default router;

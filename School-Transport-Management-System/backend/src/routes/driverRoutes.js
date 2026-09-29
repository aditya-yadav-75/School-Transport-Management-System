import express from "express";

import {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  autoAssignDriver,
  unassignDriver
} from "../controllers/driverController.js";

import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();


/*
  Driver list
*/
router.get("/", protect, getDrivers);


/*
  Single driver
*/
router.get("/:id", protect, getDriver);


/*
  Create driver
*/
router.post("/", protect, adminOnly, createDriver);


/*
  Update driver
*/
router.put("/:id", protect, adminOnly, updateDriver);


/*
  Delete driver
*/
router.delete("/:id", protect, adminOnly, deleteDriver);


/*
  Automatically assign an available driver to a route
*/
router.post(
  "/auto-assign",
  protect,
  adminOnly,
  autoAssignDriver
);


/*
  Release a driver from a route
*/
router.post(
  "/unassign",
  protect,
  adminOnly,
  unassignDriver
);


export default router;
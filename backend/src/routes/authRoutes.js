import express from "express";
import { login, me, register } from "../controllers/authController.js";
import { addChild, getChildren } from "../controllers/parentController.js";
import { parentOnly, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/children", protect, parentOnly, getChildren);
router.post("/children", protect, parentOnly, addChild);

export default router;
import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;

/* ================================
   MIDDLEWARE
================================ */

app.use(
  cors({
    origin:
      process.env.CLIENT_URL?.split(",").map((item) => item.trim()) ||
      "http://localhost:5173"
  })
);

app.use(express.json());


/* ================================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.json({
    message: "School Transport Management API is running."
  });
});


/* ================================
   API ROUTES
================================ */

app.use("/api/auth", authRoutes);

app.use("/api/routes", routeRoutes);

app.use("/api/assignments", assignmentRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/drivers", driverRoutes);


/* ================================
   ERROR HANDLER
================================ */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error."
  });
});


/* ================================
   DATABASE + SERVER
================================ */

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server running at http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
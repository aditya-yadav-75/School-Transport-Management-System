import jwt from "jsonwebtoken";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| Protect
|--------------------------------------------------------------------------
| Verifies the JWT token and attaches the logged-in user to req.user.
*/
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    // Check if Authorization header exists
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Extract token
    const token = header.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists.",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Admin Only
|--------------------------------------------------------------------------
| Allows access only to admin users.
*/
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
};

/*
|--------------------------------------------------------------------------
| Parent Only
|--------------------------------------------------------------------------
| Allows access only to parent users.
*/
export const parentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "parent") {
    return res.status(403).json({
      message: "Parent access required.",
    });
  }

  next();
};

/*
|--------------------------------------------------------------------------
| Student Only
|--------------------------------------------------------------------------
| Allows access only to student users.
*/
export const studentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "student") {
    return res.status(403).json({
      message: "Student access required.",
    });
  }

  next();
};
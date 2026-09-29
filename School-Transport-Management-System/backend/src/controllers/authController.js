import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Student from "../models/Student.js";
import { createToken } from "../utils/token.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      className,
      phone,
      accountType = "student"
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (!["student", "parent"].includes(accountType)) {
      return res.status(400).json({ message: "Invalid account type." });
    }

    if (accountType === "student" && (!rollNumber || !className)) {
      return res.status(400).json({
        message: "Roll number and class are required for a student account."
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    if (accountType === "student") {
      const existingStudent = await Student.findOne({ rollNumber });
      if (existingStudent) {
        return res.status(409).json({ message: "Roll number is already registered." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: accountType
    });

    if (accountType === "student") {
      await Student.create({
        name,
        user: user._id,
        rollNumber,
        className,
        phone
      });
    }

    return res.status(201).json({
      message: accountType === "parent" ? "Parent account created successfully." : "Student registered successfully.",
      token: createToken(user._id),
      user: publicUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({
      message: "Login successful.",
      token: createToken(user._id),
      user: publicUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });

  res.json({
    user: req.user,
    student
  });
};
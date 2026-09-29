import Student from "../models/Student.js";

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Student from "../models/Student.js";

export const getChildren = async (req, res) => {
  try {
    const children = await Student.find({ parent: req.user._id })
      .select("name rollNumber className phone parent createdAt")
      .sort({ createdAt: 1 });

    res.json(children);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addChild = async (req, res) => {
  try {
    const { name, rollNumber, className, phone } = req.body;

    if (!name || !rollNumber || !className) {
      return res.status(400).json({
        message: "Child name, roll number and class are required."
      });
    }

    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(409).json({ message: "Roll number is already registered." });
    }

    const child = await Student.create({
      name,
      rollNumber,
      className,
      phone,
      parent: req.user._id
    });

    res.status(201).json(child);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
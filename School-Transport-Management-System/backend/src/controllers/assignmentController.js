import Assignment from "../models/Assignment.js";
import Student from "../models/Student.js";
import Route from "../models/Route.js";

export const createAssignment = async (req, res) => {
  try {
    const { studentId, routeId, pickupPointId } = req.body;

    if (!studentId || !routeId || !pickupPointId) {
      return res.status(400).json({
        message: "studentId, routeId and pickupPointId are required."
      });
    }

    const student = await Student.findById(studentId).populate("user", "name email");
    if (!student) return res.status(404).json({ message: "Student not found." });

    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ message: "Route not found." });

    if (!route.active) {
      return res.status(400).json({ message: "This route is inactive." });
    }

    const existingAssignment = await Assignment.findOne({ student: studentId });
    if (existingAssignment) {
      return res.status(409).json({
        message: "Student is already assigned to a route. Update or remove the existing assignment first."
      });
    }

    const pickupPoint = route.pickupPoints.id(pickupPointId);
    if (!pickupPoint) {
      return res.status(400).json({ message: "Pickup point does not belong to this route." });
    }

    const updatedRoute = await Route.findOneAndUpdate(
      {
        _id: routeId,
        active: true,
        $expr: { $lt: ["$assignedCount", "$vehicleCapacity"] }
      },
      { $inc: { assignedCount: 1 } },
      { new: true }
    );

    if (!updatedRoute) {
      return res.status(409).json({ message: "Route has reached its seat capacity." });
    }

    try {
      const assignment = await Assignment.create({
        student: studentId,
        route: routeId,
        pickupPoint: pickupPoint._id,
        pickupPointName: pickupPoint.name
      });

      const populated = await assignment.populate([
        { path: "student", populate: { path: "user", select: "name email" } },
        { path: "route" }
      ]);

      res.status(201).json(populated);
    } catch (assignmentError) {
      await Route.findByIdAndUpdate(routeId, { $inc: { assignedCount: -1 } });
      throw assignmentError;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" }
      })
      .populate("route")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyAssignment = async (req, res) => {
  try {
    let student;

    if (req.user.role === "parent") {
      const studentId = req.query.studentId;
      if (!studentId) {
        return res.status(400).json({ message: "studentId is required for a parent account." });
      }

      student = await Student.findOne({
        _id: studentId,
        parent: req.user._id
      });
    } else {
      student = await Student.findOne({ user: req.user._id });
    }

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const assignment = await Assignment.findOne({ student: student._id }).populate("route");

    if (!assignment) {
      return res.json(null);
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRouteStudents = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found." });

    const assignments = await Assignment.find({ route: req.params.id })
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" }
      })
      .sort({ createdAt: 1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    await Route.findByIdAndUpdate(assignment.route, { $inc: { assignedCount: -1 } });

    res.json({ message: "Assignment removed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
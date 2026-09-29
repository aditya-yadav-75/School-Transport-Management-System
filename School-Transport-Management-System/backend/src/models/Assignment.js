import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true
    },
    pickupPoint: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    pickupPointName: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Assignment", assignmentSchema);

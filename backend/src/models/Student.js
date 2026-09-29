import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  unique: true,
  sparse: true
},
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    className: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
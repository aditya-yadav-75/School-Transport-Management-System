import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["available", "assigned"],
      default: "available"
    },

    assignedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Driver", driverSchema);
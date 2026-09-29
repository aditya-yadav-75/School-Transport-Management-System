import mongoose from "mongoose";

const pickupPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    order: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: true }
);

const routeSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    vehicleNumber: {
      type: String,
      required: true,
      trim: true
    },

    /*
      Actual driver reference.
      This connects the route to the Driver collection.
    */
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null
    },

    /*
      These fields are kept for easy display
      in the existing frontend.
    */
    driverName: {
      type: String,
      trim: true,
      default: ""
    },

    driverPhone: {
      type: String,
      trim: true,
      default: ""
    },

    vehicleCapacity: {
      type: Number,
      required: true,
      min: 1
    },

    assignedCount: {
      type: Number,
      default: 0,
      min: 0
    },

    pickupPoints: {
      type: [pickupPointSchema],
      default: []
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);


/* ================================
   VIRTUAL: VACANT SEATS
================================ */

routeSchema.virtual("vacantSeats").get(function () {
  return Math.max(
    0,
    this.vehicleCapacity - this.assignedCount
  );
});


/* ================================
   VIRTUAL: OCCUPANCY
================================ */

routeSchema.virtual("occupancyPercentage").get(function () {
  if (!this.vehicleCapacity) return 0;

  return Math.min(
    100,
    Math.round(
      (this.assignedCount / this.vehicleCapacity) * 100
    )
  );
});


/* ================================
   JSON / OBJECT VIRTUALS
================================ */

routeSchema.set("toJSON", {
  virtuals: true
});

routeSchema.set("toObject", {
  virtuals: true
});


/* ================================
   VALIDATE CAPACITY
================================ */

routeSchema.pre("save", function (next) {
  if (this.assignedCount > this.vehicleCapacity) {
    return next(
      new Error(
        "Assigned students cannot exceed vehicle capacity."
      )
    );
  }

  next();
});


export default mongoose.model("Route", routeSchema);
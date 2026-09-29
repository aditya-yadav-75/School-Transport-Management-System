import Route from "../models/Route.js";
import Assignment from "../models/Assignment.js";

const validatePickupPoints = (pickupPoints = []) => {
  if (!Array.isArray(pickupPoints)) {
    return "pickupPoints must be an array.";
  }

  for (const point of pickupPoints) {
    if (!point.name || !point.address || !point.order) {
      return "Each pickup point requires name, address and order.";
    }
  }

  const orders = pickupPoints.map((point) => Number(point.order));

  if (orders.some((order) => !Number.isInteger(order) || order < 1)) {
    return "Pickup point order must be a positive integer.";
  }

  if (new Set(orders).size !== orders.length) {
    return "Pickup point order values must be unique.";
  }

  return null;
};

const normaliseRoutePayload = (body) => ({
  routeName: String(body.routeName || "").trim(),
  vehicleNumber: String(body.vehicleNumber || "").trim(),
  driverName: String(body.driverName || "").trim(),
  driverPhone: String(body.driverPhone || "").trim(),
  vehicleCapacity: Number(body.vehicleCapacity),
  pickupPoints: Array.isArray(body.pickupPoints)
    ? body.pickupPoints.map((point, index) => ({
        name: String(point.name || "").trim(),
        address: String(point.address || "").trim(),
        order: Number(point.order) || index + 1
      }))
    : [],
  active: body.active === undefined ? true : Boolean(body.active)
});

export const createRoute = async (req, res) => {
  try {
    const payload = normaliseRoutePayload(req.body);

    if (
      !payload.routeName ||
      !payload.vehicleNumber ||
      !Number.isFinite(payload.vehicleCapacity) ||
      payload.vehicleCapacity < 1
    ) {
      return res.status(400).json({
        message:
          "Route name, vehicle number and a valid vehicle capacity are required."
      });
    }

    const pickupError = validatePickupPoints(payload.pickupPoints);

    if (pickupError) {
      return res.status(400).json({ message: pickupError });
    }

    const duplicate = await Route.findOne({
      routeName: payload.routeName
    });

    if (duplicate) {
      return res.status(409).json({
        message: "A route with this name already exists."
      });
    }

    const route = await Route.create(payload);

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });

    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        message: "Route not found."
      });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        message: "Route not found."
      });
    }

    const {
      routeName,
      vehicleNumber,
      driverName,
      driverPhone,
      vehicleCapacity,
      pickupPoints,
      active
    } = req.body;

    if (routeName !== undefined) {
      const cleanedName = String(routeName).trim();

      const duplicate = await Route.findOne({
        routeName: cleanedName,
        _id: { $ne: route._id }
      });

      if (duplicate) {
        return res.status(409).json({
          message: "A route with this name already exists."
        });
      }

      route.routeName = cleanedName;
    }

    if (vehicleNumber !== undefined) {
      route.vehicleNumber = String(vehicleNumber).trim();
    }

    if (driverName !== undefined) {
      route.driverName = String(driverName).trim();
    }

    if (driverPhone !== undefined) {
      route.driverPhone = String(driverPhone).trim();
    }

    if (pickupPoints !== undefined) {
      const normalisedPoints = Array.isArray(pickupPoints)
        ? pickupPoints.map((point, index) => ({
            name: String(point.name || "").trim(),
            address: String(point.address || "").trim(),
            order: Number(point.order) || index + 1
          }))
        : [];

      const pickupError = validatePickupPoints(normalisedPoints);

      if (pickupError) {
        return res.status(400).json({
          message: pickupError
        });
      }

      route.pickupPoints = normalisedPoints;
    }

    if (vehicleCapacity !== undefined) {
      const newCapacity = Number(vehicleCapacity);

      if (!Number.isFinite(newCapacity) || newCapacity < 1) {
        return res.status(400).json({
          message: "Vehicle capacity must be at least 1."
        });
      }

      if (newCapacity < route.assignedCount) {
        return res.status(400).json({
          message: `Capacity cannot be below the current assigned count (${route.assignedCount}).`
        });
      }

      route.vehicleCapacity = newCapacity;
    }

    if (active !== undefined) {
      route.active = Boolean(active);
    }

    await route.save();

    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const assignmentCount = await Assignment.countDocuments({
      route: req.params.id
    });

    if (assignmentCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete a route with student assignments. Remove assignments first."
      });
    }

    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        message: "Route not found."
      });
    }

    res.json({
      message: "Route deleted successfully."
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
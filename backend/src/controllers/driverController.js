import Driver from "../models/Driver.js";
import Route from "../models/Route.js";

/*
  GET ALL DRIVERS
*/
export const getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find()
      .populate("assignedRoute", "routeName vehicleNumber")
      .sort({ name: 1 });

    res.json(drivers);
  } catch (error) {
    next(error);
  }
};


/*
  GET SINGLE DRIVER
*/
export const getDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id).populate(
      "assignedRoute",
      "routeName vehicleNumber"
    );

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found."
      });
    }

    res.json(driver);
  } catch (error) {
    next(error);
  }
};


/*
  CREATE DRIVER
*/
export const createDriver = async (req, res, next) => {
  try {
    const { name, phone, licenseNumber } = req.body;

    if (!name || !phone || !licenseNumber) {
      return res.status(400).json({
        message: "Name, phone and license number are required."
      });
    }

    const existingDriver = await Driver.findOne({ licenseNumber });

    if (existingDriver) {
      return res.status(409).json({
        message: "A driver with this license number already exists."
      });
    }

    const driver = await Driver.create({
      name,
      phone,
      licenseNumber,
      status: "available",
      assignedRoute: null
    });

    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
};


/*
  UPDATE DRIVER
*/
export const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found."
      });
    }

    const { name, phone, licenseNumber } = req.body;

    if (name !== undefined) driver.name = name;
    if (phone !== undefined) driver.phone = phone;
    if (licenseNumber !== undefined) {
      driver.licenseNumber = licenseNumber;
    }

    await driver.save();

    res.json(driver);
  } catch (error) {
    next(error);
  }
};


/*
  DELETE DRIVER
*/
export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found."
      });
    }

    if (driver.assignedRoute) {
      return res.status(400).json({
        message:
          "This driver is currently assigned to a route. Unassign the driver first."
      });
    }

    await Driver.findByIdAndDelete(req.params.id);

    res.json({
      message: "Driver deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};


/*
  AUTO ASSIGN DRIVER TO A ROUTE
*/
export const autoAssignDriver = async (req, res, next) => {
  try {
    const { routeId } = req.body;

    if (!routeId) {
      return res.status(400).json({
        message: "Route ID is required."
      });
    }

    const route = await Route.findById(routeId);

    if (!route) {
      return res.status(404).json({
        message: "Route not found."
      });
    }

    if (route.driver) {
      return res.status(400).json({
        message: "This route already has a driver."
      });
    }

    /*
      Find the first available driver.
    */
    const driver = await Driver.findOne({
      status: "available",
      assignedRoute: null
    }).sort({ createdAt: 1 });

    if (!driver) {
      return res.status(409).json({
        message: "No vacant drivers are currently available."
      });
    }

    /*
      Assign driver to route.
    */
    route.driver = driver._id;
    route.driverName = driver.name;
    route.driverPhone = driver.phone;

    await route.save();

    /*
      Mark driver as assigned.
    */
    driver.status = "assigned";
    driver.assignedRoute = route._id;

    await driver.save();

    const updatedDriver = await Driver.findById(driver._id).populate(
      "assignedRoute",
      "routeName vehicleNumber"
    );

    res.json({
      message: "Driver assigned successfully.",
      driver: updatedDriver,
      route
    });
  } catch (error) {
    next(error);
  }
};


/*
  UNASSIGN DRIVER FROM ROUTE
*/
export const unassignDriver = async (req, res, next) => {
  try {
    const { routeId } = req.body;

    if (!routeId) {
      return res.status(400).json({
        message: "Route ID is required."
      });
    }

    const route = await Route.findById(routeId);

    if (!route) {
      return res.status(404).json({
        message: "Route not found."
      });
    }

    if (!route.driver) {
      return res.status(400).json({
        message: "This route does not have a driver."
      });
    }

    const driver = await Driver.findById(route.driver);

    if (driver) {
      driver.status = "available";
      driver.assignedRoute = null;
      await driver.save();
    }

    route.driver = null;
    route.driverName = "";
    route.driverPhone = "";

    await route.save();

    res.json({
      message: "Driver is now available.",
      route
    });
  } catch (error) {
    next(error);
  }
};
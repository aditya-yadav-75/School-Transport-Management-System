import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Student from "./models/Student.js";
import Route from "./models/Route.js";
import Assignment from "./models/Assignment.js";
import Driver from "./models/Driver.js";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing from .env");
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected.");

    /*
     * ---------------------------------------------------------
     * 1. CLEAR OLD TEST DATA
     * ---------------------------------------------------------
     */

    await Assignment.deleteMany({});
    await Student.deleteMany({});
    await Route.deleteMany({});
    await Driver.deleteMany({});

    // Keep the admin account if it already exists.
    await User.deleteMany({
      role: { $in: ["student", "parent"] }
    });

    console.log("Old test data cleared.");

    /*
     * ---------------------------------------------------------
     * 2. PASSWORD
     * ---------------------------------------------------------
     */

    const passwordHash = await bcrypt.hash("Password123", 10);

    /*
     * ---------------------------------------------------------
     * 3. PARENT ACCOUNTS
     * ---------------------------------------------------------
     */

    const parents = await User.insertMany([
      {
        name: "Rahul Sharma",
        email: "rahul.parent@example.com",
        password: passwordHash,
        role: "parent"
      },
      {
        name: "Priya Mehta",
        email: "priya.parent@example.com",
        password: passwordHash,
        role: "parent"
      },
      {
        name: "Amit Patel",
        email: "amit.parent@example.com",
        password: passwordHash,
        role: "parent"
      },
      {
        name: "Neha Desai",
        email: "neha.parent@example.com",
        password: passwordHash,
        role: "parent"
      }
    ]);

    console.log(`${parents.length} parent accounts created.`);

    /*
     * ---------------------------------------------------------
     * 4. STUDENTS
     * ---------------------------------------------------------
     */

    const students = await Student.insertMany([
      {
        name: "Aarav Sharma",
        parent: parents[0]._id,
        rollNumber: "ST001",
        className: "10-A",
        phone: "9876500001"
      },
      {
        name: "Ananya Sharma",
        parent: parents[0]._id,
        rollNumber: "ST002",
        className: "8-B",
        phone: "9876500002"
      },
      {
        name: "Vihaan Mehta",
        parent: parents[1]._id,
        rollNumber: "ST003",
        className: "9-A",
        phone: "9876500003"
      },
      {
        name: "Sara Mehta",
        parent: parents[1]._id,
        rollNumber: "ST004",
        className: "7-C",
        phone: "9876500004"
      },
      {
        name: "Arjun Patel",
        parent: parents[2]._id,
        rollNumber: "ST005",
        className: "10-B",
        phone: "9876500005"
      },
      {
        name: "Ishita Patel",
        parent: parents[2]._id,
        rollNumber: "ST006",
        className: "6-A",
        phone: "9876500006"
      },
      {
        name: "Kabir Desai",
        parent: parents[3]._id,
        rollNumber: "ST007",
        className: "9-B",
        phone: "9876500007"
      },
      {
        name: "Myra Desai",
        parent: parents[3]._id,
        rollNumber: "ST008",
        className: "8-A",
        phone: "9876500008"
      },
      {
        name: "Reyansh Kapoor",
        rollNumber: "ST009",
        className: "10-C",
        phone: "9876500009"
      },
      {
        name: "Aanya Kapoor",
        rollNumber: "ST010",
        className: "7-A",
        phone: "9876500010"
      },
      {
        name: "Dev Malhotra",
        rollNumber: "ST011",
        className: "9-C",
        phone: "9876500011"
      },
      {
        name: "Kiara Malhotra",
        rollNumber: "ST012",
        className: "6-B",
        phone: "9876500012"
      }
    ]);

    console.log(`${students.length} students created.`);

    /*
     * ---------------------------------------------------------
     * 5. ROUTES / BUSES
     *
     * We deliberately create:
     *
     * Route 1 -> 32 seats, 18 students
     * Route 2 -> 40 seats, 31 students
     * Route 3 -> 30 seats, 12 students
     * Route 4 -> 40 seats, 0 students
     *
     * This gives us realistic vacant-seat numbers.
     * ---------------------------------------------------------
     */

    const routes = await Route.insertMany([
      {
        routeName: "Route A - Dombivli",
        vehicleNumber: "MH-04-AB-1234",
        vehicleCapacity: 32,
        assignedCount: 18,
        pickupPoints: [
          {
            name: "Casa Bella",
            address: "Casa Bella Gold, Palava",
            order: 1
          },
          {
            name: "Lodha Palava",
            address: "Lodha Palava Main Gate",
            order: 2
          },
          {
            name: "Dombivli East",
            address: "Dombivli East Station Road",
            order: 3
          },
          {
            name: "School Gate",
            address: "Main School Entrance",
            order: 4
          }
        ],
        active: true
      },

      {
        routeName: "Route B - Kalyan",
        vehicleNumber: "MH-05-CD-5678",
        vehicleCapacity: 40,
        assignedCount: 31,
        pickupPoints: [
          {
            name: "Kalyan West",
            address: "Kalyan West Bus Stop",
            order: 1
          },
          {
            name: "Khadakpada",
            address: "Khadakpada Circle",
            order: 2
          },
          {
            name: "Wayle Nagar",
            address: "Wayle Nagar Main Road",
            order: 3
          },
          {
            name: "School Gate",
            address: "Main School Entrance",
            order: 4
          }
        ],
        active: true
      },

      {
        routeName: "Route C - Navi Mumbai",
        vehicleNumber: "MH-43-EF-9012",
        vehicleCapacity: 30,
        assignedCount: 12,
        pickupPoints: [
          {
            name: "Airoli",
            address: "Airoli Sector 5",
            order: 1
          },
          {
            name: "Ghansoli",
            address: "Ghansoli Station Road",
            order: 2
          },
          {
            name: "Koparkhairane",
            address: "Koparkhairane Sector 14",
            order: 3
          },
          {
            name: "School Gate",
            address: "Main School Entrance",
            order: 4
          }
        ],
        active: true
      },

      {
        routeName: "Route D - Belapur",
        vehicleNumber: "MH-46-GH-3456",
        vehicleCapacity: 40,
        assignedCount: 0,
        pickupPoints: [
          {
            name: "CBD Belapur",
            address: "Belapur CBD",
            order: 1
          },
          {
            name: "Seawoods",
            address: "Seawoods Station",
            order: 2
          },
          {
            name: "Nerul",
            address: "Nerul East",
            order: 3
          },
          {
            name: "School Gate",
            address: "Main School Entrance",
            order: 4
          }
        ],
        active: true
      }
    ]);

    console.log(`${routes.length} routes created.`);

    /*
     * ---------------------------------------------------------
     * 6. DRIVERS
     *
     * IMPORTANT:
     *
     * We intentionally create:
     *
     * Driver 1 -> assigned
     * Driver 2 -> assigned
     * Driver 3 -> assigned
     * Driver 4 -> available
     * Driver 5 -> available
     *
     * This lets you test AUTO ASSIGN immediately.
     * ---------------------------------------------------------
     */

    const drivers = await Driver.insertMany([
      {
        name: "Rajesh Kumar",
        phone: "9876541001",
        licenseNumber: "MH14-DRV-001",
        status: "assigned",
        assignedRoute: routes[0]._id
      },

      {
        name: "Suresh Patil",
        phone: "9876541002",
        licenseNumber: "MH14-DRV-002",
        status: "assigned",
        assignedRoute: routes[1]._id
      },

      {
        name: "Mahesh Yadav",
        phone: "9876541003",
        licenseNumber: "MH14-DRV-003",
        status: "assigned",
        assignedRoute: routes[2]._id
      },

      {
        name: "Vikram Singh",
        phone: "9876541004",
        licenseNumber: "MH14-DRV-004",
        status: "available",
        assignedRoute: null
      },

      {
        name: "Ramesh Jadhav",
        phone: "9876541005",
        licenseNumber: "MH14-DRV-005",
        status: "available",
        assignedRoute: null
      }
    ]);

    console.log(`${drivers.length} drivers created.`);

    /*
     * ---------------------------------------------------------
     * 7. STUDENT ASSIGNMENTS
     *
     * We create actual Assignment documents for the first
     * 8 students so the dashboard can show real assignment
     * records.
     *
     * Route assignedCount values above represent the realistic
     * overall occupancy for dashboard testing.
     * ---------------------------------------------------------
     */

    const route1Pickup = routes[0].pickupPoints[0];
    const route2Pickup = routes[1].pickupPoints[0];
    const route3Pickup = routes[2].pickupPoints[0];

    const assignments = [
      {
        student: students[0]._id,
        route: routes[0]._id,
        pickupPoint: route1Pickup._id,
        pickupPointName: route1Pickup.name
      },

      {
        student: students[1]._id,
        route: routes[0]._id,
        pickupPoint: route1Pickup._id,
        pickupPointName: route1Pickup.name
      },

      {
        student: students[2]._id,
        route: routes[0]._id,
        pickupPoint: route1Pickup._id,
        pickupPointName: route1Pickup.name
      },

      {
        student: students[3]._id,
        route: routes[0]._id,
        pickupPoint: route1Pickup._id,
        pickupPointName: route1Pickup.name
      },

      {
        student: students[4]._id,
        route: routes[1]._id,
        pickupPoint: route2Pickup._id,
        pickupPointName: route2Pickup.name
      },

      {
        student: students[5]._id,
        route: routes[1]._id,
        pickupPoint: route2Pickup._id,
        pickupPointName: route2Pickup.name
      },

      {
        student: students[6]._id,
        route: routes[2]._id,
        pickupPoint: route3Pickup._id,
        pickupPointName: route3Pickup.name
      },

      {
        student: students[7]._id,
        route: routes[2]._id,
        pickupPoint: route3Pickup._id,
        pickupPointName: route3Pickup.name
      }
    ];

    await Assignment.insertMany(assignments);

    console.log(`${assignments.length} student assignments created.`);

    /*
     * ---------------------------------------------------------
     * 8. SUMMARY
     * ---------------------------------------------------------
     */

    console.log("\n========================================");
    console.log("       ROUTEFLOW SAMPLE DATA");
    console.log("========================================");

    console.log("\nPARENT ACCOUNTS");
    console.log("----------------------------------------");
    console.log("rahul.parent@example.com");
    console.log("priya.parent@example.com");
    console.log("amit.parent@example.com");
    console.log("neha.parent@example.com");
    console.log("Password: Password123");

    console.log("\nSTUDENTS");
    console.log("----------------------------------------");
    console.log(`Students created: ${students.length}`);

    console.log("\nBUSES / ROUTES");
    console.log("----------------------------------------");
    console.log("Route A: 32 seats | 18 occupied | 14 vacant");
    console.log("Route B: 40 seats | 31 occupied | 9 vacant");
    console.log("Route C: 30 seats | 12 occupied | 18 vacant");
    console.log("Route D: 40 seats | 0 occupied | 40 vacant");

    console.log("\nDRIVERS");
    console.log("----------------------------------------");
    console.log("Rajesh Kumar  -> Route A");
    console.log("Suresh Patil  -> Route B");
    console.log("Mahesh Yadav  -> Route C");
    console.log("Vikram Singh  -> AVAILABLE");
    console.log("Ramesh Jadhav -> AVAILABLE");

    console.log("\nAUTO-ASSIGN TEST");
    console.log("----------------------------------------");
    console.log("Open Drivers page.");
    console.log("You should see 2 available drivers.");
    console.log("You should see Route D without a driver.");
    console.log("Click 'Auto assign' on Route D.");
    console.log("Vikram Singh should be assigned.");
    console.log("One available driver should remain.");

    console.log("\n========================================");
    console.log("       SEED COMPLETE");
    console.log("========================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\nSeed failed:");
    console.error(error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
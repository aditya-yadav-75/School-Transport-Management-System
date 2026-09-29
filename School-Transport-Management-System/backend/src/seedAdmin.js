import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

const seedAdmin = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@school.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const name = process.env.ADMIN_NAME || "Transport Admin";

  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin already exists.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin"
  });

  console.log(`Admin created: ${email}`);
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});

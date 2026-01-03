import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

async function run() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin1234!";
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
    process.exit(1);
  }

  await connectDB(env.mongoUri);

  let user = await User.findOne({ email });
  if (user) {
    user.role = "admin";
    if (password) {
      user.password = password; // will hash via pre-save hook
    }
    user.name = name;
    await user.save();
    console.log(`Updated admin user: ${email}`);
  } else {
    user = new User({ email, password, name, role: "admin" });
    await user.save();
    console.log(`Created admin user: ${email}`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

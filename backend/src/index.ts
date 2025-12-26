import { createServer } from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

async function start() {
  try {
    await connectDB(env.mongoUri);
    const app = createApp();
    const server = createServer(app);

    server.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

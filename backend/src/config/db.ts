import mongoose from "mongoose";

const stateNames: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export async function connectDB(uri: string) {
  mongoose.set("strictQuery", false);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  const state = mongoose.connection.readyState;
  console.log(`MongoDB ${stateNames[state] || state}`);
  return mongoose.connection;
}

export function getDbState() {
  const state = mongoose.connection.readyState;
  return stateNames[state] || String(state);
}

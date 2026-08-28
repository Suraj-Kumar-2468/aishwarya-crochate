import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    await mongoose.connect(uri);
    console.log("MongoDB connected (persistent)");
    return;
  }

  console.warn(
    "MONGODB_URI not set — starting an in-memory MongoDB for local development. " +
      "Data will NOT persist across restarts. Set MONGODB_URI (e.g. a free MongoDB Atlas cluster) for real persistence."
  );
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri());
  console.log("MongoDB connected (in-memory, non-persistent)");
}

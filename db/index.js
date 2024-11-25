import mongoose from "mongoose";
import "dotenv/config";

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error(`uri is not defined`);
    }

    const connect = await mongoose.connect(uri);
    console.log(`connected to mongo db: ${connect.connection.host}`);
  } catch (err) {
    console.error(`error occurred while connecting to db: ${err.message}`);
    process.exit(1);
  }
}

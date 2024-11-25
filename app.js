import express from "express";
import "dotenv/config";
import { connectDB } from "./db/index.js";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 3333;
app.use(express.json());
let db;

app.get("/", (_req, res) => {
  res.send("server is running");
});

async function startServer() {
  try {
    await connectDB();
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error(`uri is not defined`);
    }

    const client = new MongoClient(uri);

    await client.connect();

    db = client.db("my_database");
    console.log("connected to MongoDB");

    app.listen(port, () => {
      console.log(`server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error(`failed to start the server: ${err.message}`);
    process.exit(1);
  }
}

startServer();

app.post("/products", async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const product = { name, price, description };
    const result = await db.collection("products").insertOne(product);
    res.status(201).json({ success: true, productId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/products", async (_req, res) => {
  try {
    const products = await db.collection("products").find().toArray();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { name, price, description } }
      );
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
    res.status(200).json({ success: true, message: "product updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
    res.status(200).json({ success: true, message: "product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

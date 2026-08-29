import "dotenv/config";
import express from "express";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { connectDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import contentRoutes from "./routes/content.js";
import uploadRoutes from "./routes/upload.js";
import Product from "./models/Product.js";
import Content from "./models/Content.js";
import { loadSeedData } from "./seedData.js";

async function seedIfEmpty() {
  const [productCount, contentCount] = await Promise.all([
    Product.countDocuments(),
    Content.countDocuments(),
  ]);
  if (productCount > 0 || contentCount > 0) return;

  const { contentJson, productsJson } = await loadSeedData();
  await Content.create({ ...contentJson, categories: productsJson.categories });
  await Product.insertMany(productsJson.products.map(({ id, ...rest }) => rest));
  console.log("Database was empty — seeded default content and products.");
}

if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD) {
  console.error("Missing JWT_SECRET or ADMIN_PASSWORD in server/.env — copy server/.env.example to server/.env and fill both in.");
  process.exit(1);
}

cloudinary.config(); // reads CLOUDINARY_URL from env

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;

connectDb()
  .then(seedIfEmpty)
  .then(() => {
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  });

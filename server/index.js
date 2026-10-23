import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { v2 as cloudinary } from "cloudinary";
import { connectDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import contentRoutes from "./routes/content.js";
import customerRoutes from "./routes/customers.js";
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

if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
  console.error("CORS_ORIGIN must be set in production (your storefront URL).");
  process.exit(1);
}

if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD) {
  console.error("Missing JWT_SECRET or ADMIN_PASSWORD in server/.env — copy server/.env.example to server/.env and fill both in.");
  process.exit(1);
}

cloudinary.config(); // reads CLOUDINARY_URL from env

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "100kb" }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  // Log only the error type: messages and stacks can contain user-supplied data.
  console.error("Request error:", err.name);
  if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;

connectDb()
  .then(seedIfEmpty)
  .then(() => {
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  });

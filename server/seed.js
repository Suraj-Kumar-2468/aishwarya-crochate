import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import Product from "./models/Product.js";
import Content from "./models/Content.js";
import { loadSeedData } from "./seedData.js";

async function seed() {
  await connectDb();
  const { contentJson, productsJson } = await loadSeedData();

  await Content.deleteMany({});
  await Content.create({ ...contentJson, categories: productsJson.categories });

  await Product.deleteMany({});
  await Product.insertMany(productsJson.products.map(({ id, ...rest }) => rest));

  console.log(`Seeded 1 content doc and ${productsJson.products.length} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

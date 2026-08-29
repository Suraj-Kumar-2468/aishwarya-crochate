import "dotenv/config";
import { readFile, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(__dirname, "../../public/products");

async function main() {
  cloudinary.config();
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const files = await readdir(productsDir);
  const mapping = {};

  for (const file of files) {
    const filePath = path.join(productsDir, file);
    const result = await cloudinary.uploader.upload(filePath, { folder: "aishwarya-crochet/products" });
    mapping[`/products/${file}`] = result.secure_url;
    console.log(`Uploaded ${file} -> ${result.secure_url}`);
  }

  for (const [oldPath, newUrl] of Object.entries(mapping)) {
    const res = await Product.updateMany({ image: oldPath }, { $set: { image: newUrl } });
    console.log(`DB update for ${oldPath}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  await mongoose.disconnect();
  console.log(JSON.stringify(mapping, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

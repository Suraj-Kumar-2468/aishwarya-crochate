import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

function publicIdFromUrl(url) {
  const match = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/.exec(url || "");
  return match ? match[1] : null;
}

function withImagesFallback(product) {
  if (product.images && product.images.length) return product;
  const obj = product.toObject();
  obj.images = obj.image ? [{ url: obj.image, publicId: "" }] : [];
  return obj;
}

router.get("/", asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products.map(withImagesFallback));
}));

router.post("/", requireAdmin, asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}));

router.put("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
}));

router.delete("/:id", requireAdmin, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const images = product.images?.length ? product.images : product.image ? [{ url: product.image }] : [];
  for (const img of images) {
    const publicId = img.publicId || publicIdFromUrl(img.url);
    if (publicId) cloudinary.uploader.destroy(publicId).catch(() => {});
  }
  res.json({ ok: true });
}));

export default router;

import { Router } from "express";
import Product from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

router.post("/", requireAdmin, async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
});

export default router;

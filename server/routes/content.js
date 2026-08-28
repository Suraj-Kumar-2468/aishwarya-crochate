import { Router } from "express";
import Content, { getOrCreateContent } from "../models/Content.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const content = await getOrCreateContent();
  res.json(content);
});

router.put("/", requireAdmin, async (req, res) => {
  const current = await getOrCreateContent();
  Object.assign(current, req.body);
  await current.save();
  res.json(current);
});

export default router;

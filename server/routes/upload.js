import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const router = Router();

const ALLOWED_FOLDERS = ["products", "testimonials", "brand", "hero", "badges"];

router.post("/", requireAdmin, upload.single("image"), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const folder = ALLOWED_FOLDERS.includes(req.body.folder) ? req.body.folder : "products";

  const stream = cloudinary.uploader.upload_stream(
    { folder: `aishwarya-crochet/${folder}` },
    (err, result) => {
      if (err) return res.status(500).json({ error: "Upload failed" });
      res.json({ url: result.secure_url, publicId: result.public_id });
    }
  );
  stream.end(req.file.buffer);
}));

router.delete("/", requireAdmin, asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) return res.status(400).json({ error: "publicId required" });
  try {
    await cloudinary.uploader.destroy(publicId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
}));

export default router;

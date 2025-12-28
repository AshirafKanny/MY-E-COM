import { Router } from "express";
import mongoose from "mongoose";
import { authRequired, requireRole } from "../middleware/auth.js";
import { Product } from "../models/Product.js";

const router = Router();

router.get("/", async (req, res) => {
  const { q, category, featured, minPrice, maxPrice, page = "1", limit = "12" } = req.query;

  const filters: Record<string, unknown> = {};

  if (q && typeof q === "string") {
    filters.title = { $regex: q, $options: "i" };
  }

  if (category && typeof category === "string") {
    filters.category = category;
  }

  if (featured === "true") {
    filters.isFeatured = true;
  }

  if (minPrice || maxPrice) {
    filters.price = {} as Record<string, number>;
    if (minPrice) (filters.price as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filters.price as Record<string, number>).$lte = Number(maxPrice);
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const skip = (pageNum - 1) * pageSize;

  const [items, total] = await Promise.all([
    Product.find(filters).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
    Product.countDocuments(filters),
  ]);

  res.json({ items, total, page: pageNum, pageSize });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid product id" });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }

  res.json({ product });
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { title, description, price, image, category, stock, isFeatured } = req.body;

  if (!title || typeof price === "undefined") {
    return res.status(400).json({ message: "title and price are required" });
  }

  try {
    const product = new Product({ title, description, price, image, category, stock, isFeatured });
    await product.save();
    res.status(201).json({ product });
  } catch (err) {
    console.error("Create product error", err);
    res.status(500).json({ message: "failed to create product" });
  }
});

export default router;
